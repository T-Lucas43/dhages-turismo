import { NextResponse, type NextRequest } from "next/server";
import { writeAudit } from "@/lib/admin/audit";
import { authenticateAdminRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { storageProvider } from "@/lib/storage/local-storage-provider";

export async function POST(request: NextRequest) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Selecione uma imagem ou vídeo." }, { status: 400 });
  try {
    const saved = await storageProvider.savePackageMedia({ packageId: "gallery", originalName: file.name, buffer: Buffer.from(await file.arrayBuffer()) });
    const last = await prisma.galleryItem.aggregate({ _max: { sortOrder: true } });
    const item = await prisma.galleryItem.create({ data: { title: String(formData.get("title") ?? "").trim() || file.name.replace(/\.[^.]+$/, ""), path: saved.path, mediaType: saved.type, altText: String(formData.get("altText") ?? "").trim() || null, active: true, sortOrder: (last._max.sortOrder ?? -1) + 1 } });
    await writeAudit({ adminUserId: session.userId, action: "GALLERY_MEDIA_UPLOADED", entityType: "GalleryItem", entityId: item.id, summary: `${saved.type === "IMAGE" ? "Imagem" : "Vídeo"} adicionado à galeria.` });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível enviar a mídia." }, { status: 400 });
  }
}
