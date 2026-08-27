import { CollectionManager, type CollectionRecord } from "@/components/admin/collection-manager";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const records = await prisma.packageCategory.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return <CollectionManager entity="categorias" title="Categorias" singular="Categoria" description="Organize os pacotes por tipo de experiência." records={records.map((item) => ({ id: item.id, name: item.name, slug: item.slug, description: item.description, active: item.active, sortOrder: item.sortOrder })) as CollectionRecord[]} columns={[{ key: "name", label: "Nome" }, { key: "slug", label: "Slug" }, { key: "active", label: "Status", format: "active" }, { key: "sortOrder", label: "Ordem" }]} fields={[{ key: "name", label: "Nome", required: true }, { key: "slug", label: "Slug", required: true }, { key: "description", label: "Descrição", type: "textarea", wide: true }, { key: "sortOrder", label: "Ordem", type: "number", defaultValue: 0 }, { key: "active", label: "Status", type: "checkbox", defaultValue: true }]} />;
}
