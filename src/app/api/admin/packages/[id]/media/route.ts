import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdminRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { storageProvider } from "@/lib/storage/local-storage-provider";

export async function POST(request: NextRequest, context: RouteContext<"/api/admin/packages/[id]/media">) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });

  const { id: packageId } = await context.params;
  const travelPackage = await prisma.package.findFirst({ where: { id: packageId, deletedAt: null }, select: { id: true } });
  if (!travelPackage) return NextResponse.json({ error: "Pacote não encontrado." }, { status: 404 });

  const formData = await request.formData();
  const files = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
  if (!files.length) return NextResponse.json({ error: "Selecione pelo menos uma imagem ou vídeo." }, { status: 400 });
  if (files.length > 12) return NextResponse.json({ error: "Envie no máximo 12 arquivos por vez." }, { status: 400 });

  const currentMedia = await prisma.packageMedia.count({ where: { packageId } });
  const savedPaths: string[] = [];
  try {
    const created = [];
    for (const [index, file] of files.entries()) {
      const saved = await storageProvider.savePackageMedia({ packageId, originalName: file.name, buffer: Buffer.from(await file.arrayBuffer()) });
      savedPaths.push(saved.path, saved.thumbnailPath ?? "", saved.posterPath ?? "");
      const media = await prisma.packageMedia.create({
        data: {
          packageId,
          type: saved.type,
          path: saved.path,
          thumbnailPath: saved.thumbnailPath,
          posterPath: saved.posterPath,
          altText: `${travelPackage.id} — mídia ${currentMedia + index + 1}`,
          mimeType: saved.mimeType,
          sizeBytes: BigInt(saved.sizeBytes),
          width: saved.width,
          height: saved.height,
          isCover: currentMedia === 0 && index === 0 && saved.type === "IMAGE",
          isPreview: currentMedia === 0 && index === 0 && saved.type === "VIDEO",
          sortOrder: currentMedia + index,
        },
      });
      created.push({ ...media, sizeBytes: media.sizeBytes.toString() });
    }

    await prisma.auditLog.create({ data: { adminUserId: session.userId, action: "MEDIA_UPLOADED", entityType: "Package", entityId: packageId, summary: `${created.length} mídia(s) adicionada(s).` } });
    return NextResponse.json({ media: created }, { status: 201 });
  } catch (error) {
    await Promise.all(savedPaths.filter(Boolean).map((path) => storageProvider.delete(path.replace(/^\/uploads\/?/, "")).catch(() => undefined)));
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível enviar as mídias." }, { status: 400 });
  }
}
