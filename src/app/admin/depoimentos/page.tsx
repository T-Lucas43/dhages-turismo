import { CollectionManager, type CollectionRecord } from "@/components/admin/collection-manager";
import { prisma } from "@/lib/prisma";

export default async function TestimonialsPage() {
  const records = await prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return <CollectionManager entity="depoimentos" title="Depoimentos" singular="Depoimento" description="Gerencie relatos reais exibidos no site público." records={records.map((item) => ({ id: item.id, name: item.name, destination: item.destination, quote: item.quote, rating: item.rating, avatarPath: item.avatarPath, active: item.active, sortOrder: item.sortOrder })) as CollectionRecord[]} columns={[{ key: "name", label: "Viajante" }, { key: "destination", label: "Destino" }, { key: "rating", label: "Nota", format: "rating" }, { key: "active", label: "Status", format: "published" }]} fields={[{ key: "name", label: "Nome", required: true }, { key: "destination", label: "Destino da viagem" }, { key: "quote", label: "Depoimento", type: "textarea", required: true, wide: true }, { key: "rating", label: "Avaliação (1 a 5)", type: "number", defaultValue: 5 }, { key: "avatarPath", label: "Caminho do avatar" }, { key: "sortOrder", label: "Ordem", type: "number", defaultValue: 0 }, { key: "active", label: "Status", type: "checkbox", defaultValue: true }]} />;
}
