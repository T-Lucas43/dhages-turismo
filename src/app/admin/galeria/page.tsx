import { CollectionManager, type CollectionRecord } from "@/components/admin/collection-manager";
import { GalleryUpload } from "@/components/admin/gallery-upload";
import { prisma } from "@/lib/prisma";

export default async function GalleryAdminPage() {
  const records = await prisma.galleryItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return <><div className="admin-content gallery-upload-wrapper"><GalleryUpload /></div><CollectionManager entity="galeria" title="Galeria" singular="Mídia" description="Organize imagens e vídeos de viagens realizadas." records={records.map((item) => ({ id: item.id, title: item.title, path: item.path, mediaType: item.mediaType, altText: item.altText, active: item.active, sortOrder: item.sortOrder })) as CollectionRecord[]} columns={[{ key: "title", label: "Título" }, { key: "mediaType", label: "Tipo", format: "mediaType" }, { key: "path", label: "Arquivo" }, { key: "active", label: "Status", format: "published" }]} fields={[{ key: "title", label: "Título" }, { key: "path", label: "Caminho do arquivo", required: true, placeholder: "/uploads/..." }, { key: "mediaType", label: "Tipo", type: "select", defaultValue: "IMAGE", options: [{ value: "IMAGE", label: "Imagem" }, { value: "VIDEO", label: "Vídeo" }] }, { key: "altText", label: "Texto alternativo", wide: true }, { key: "sortOrder", label: "Ordem", type: "number", defaultValue: 0 }, { key: "active", label: "Status", type: "checkbox", defaultValue: true }]} /></>;
}
