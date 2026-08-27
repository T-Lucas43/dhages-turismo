import { NextResponse, type NextRequest } from "next/server";
import { writeAudit } from "@/lib/admin/audit";
import { authenticateAdminRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { storageProvider } from "@/lib/storage/local-storage-provider";

export async function POST(request: NextRequest, context: RouteContext<"/api/admin/packages/[id]/media/[mediaId]">) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  const { id: packageId, mediaId } = await context.params;
  const media = await prisma.packageMedia.findFirst({ where: { id: mediaId, packageId, type: "VIDEO" } });
  if (!media) return NextResponse.json({ error: "Vídeo não encontrado." }, { status: 404 });
  const formData = await request.formData();
  const poster = formData.get("poster");
  if (!(poster instanceof File) || !poster.size) return NextResponse.json({ error: "Selecione uma imagem para o pôster." }, { status: 400 });
  try {
    const saved = await storageProvider.savePackageMedia({ packageId: `${packageId}/posters`, originalName: poster.name, buffer: Buffer.from(await poster.arrayBuffer()) });
    if (saved.type !== "IMAGE") {
      await storageProvider.delete(saved.path.replace(/^\/uploads\/?/, ""));
      return NextResponse.json({ error: "O pôster precisa ser uma imagem." }, { status: 400 });
    }
    const updated = await prisma.packageMedia.update({ where: { id: mediaId }, data: { posterPath: saved.path, thumbnailPath: saved.thumbnailPath } });
    await writeAudit({ adminUserId: session.userId, action: "VIDEO_POSTER_UPDATED", entityType: "PackageMedia", entityId: mediaId, summary: "Pôster do vídeo atualizado." });
    return NextResponse.json({ media: { ...updated, sizeBytes: updated.sizeBytes.toString() } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível enviar o pôster." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext<"/api/admin/packages/[id]/media/[mediaId]">) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  const { id: packageId, mediaId } = await context.params;
  const media = await prisma.packageMedia.findFirst({ where: { id: mediaId, packageId } });
  if (!media) return NextResponse.json({ error: "Mídia não encontrada." }, { status: 404 });
  const body = await request.json().catch(() => null) as { primary?: boolean; altText?: string; sortOrder?: number } | null;
  if (!body) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const updated = await prisma.$transaction(async (transaction) => {
    if (body.primary) {
      if (media.type === "IMAGE") await transaction.packageMedia.updateMany({ where: { packageId, type: "IMAGE" }, data: { isCover: false } });
      if (media.type === "VIDEO") await transaction.packageMedia.updateMany({ where: { packageId, type: "VIDEO" }, data: { isPreview: false } });
    }
    return transaction.packageMedia.update({
      where: { id: mediaId },
      data: {
        ...(typeof body.altText === "string" ? { altText: body.altText.trim().slice(0, 240) || null } : {}),
        ...(Number.isInteger(body.sortOrder) ? { sortOrder: Math.max(0, body.sortOrder as number) } : {}),
        ...(body.primary && media.type === "IMAGE" ? { isCover: true } : {}),
        ...(body.primary && media.type === "VIDEO" ? { isPreview: true } : {}),
      },
    });
  });
  await writeAudit({ adminUserId: session.userId, action: "MEDIA_UPDATED", entityType: "PackageMedia", entityId: mediaId, summary: "Ordem, texto alternativo ou mídia principal atualizados." });
  return NextResponse.json({ media: { ...updated, sizeBytes: updated.sizeBytes.toString() } });
}

export async function DELETE(request: NextRequest, context: RouteContext<"/api/admin/packages/[id]/media/[mediaId]">) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  const { id: packageId, mediaId } = await context.params;
  const media = await prisma.packageMedia.findFirst({ where: { id: mediaId, packageId } });
  if (!media) return NextResponse.json({ error: "Mídia não encontrada." }, { status: 404 });

  await prisma.packageMedia.delete({ where: { id: mediaId } });
  await Promise.all([media.path, media.thumbnailPath, media.posterPath].filter((path): path is string => typeof path === "string" && path.startsWith("/uploads/")).map((path) => storageProvider.delete(path.replace(/^\/uploads\/?/, "")).catch(() => undefined)));
  if (media.isCover) {
    const replacement = await prisma.packageMedia.findFirst({ where: { packageId, type: "IMAGE" }, orderBy: { sortOrder: "asc" } });
    if (replacement) await prisma.packageMedia.update({ where: { id: replacement.id }, data: { isCover: true } });
  }
  if (media.isPreview) {
    const replacement = await prisma.packageMedia.findFirst({ where: { packageId, type: "VIDEO" }, orderBy: { sortOrder: "asc" } });
    if (replacement) await prisma.packageMedia.update({ where: { id: replacement.id }, data: { isPreview: true } });
  }
  await writeAudit({ adminUserId: session.userId, action: "MEDIA_DELETED", entityType: "PackageMedia", entityId: mediaId, summary: "Mídia removida do pacote." });
  return NextResponse.json({ deleted: true });
}
