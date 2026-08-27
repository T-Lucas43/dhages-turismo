import { PackageTable } from "@/components/admin/package-table";
import { prisma } from "@/lib/prisma";

export default async function ArchivedPackagesPage() {
  const rows = await prisma.package.findMany({
    where: { deletedAt: null, publicationStatus: "ARCHIVED" },
    orderBy: { updatedAt: "desc" },
    include: { category: { select: { name: true } }, destination: { select: { name: true, stateCode: true } }, media: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1 } },
  });
  return <PackageTable archived rows={rows.map((row) => ({ id: row.id, name: row.name, slug: row.slug, destination: row.destination.name, stateCode: row.destination.stateCode, category: row.category.name, departureAt: row.departureAt.toISOString(), cashPrice: row.cashPrice.toString(), publicationStatus: row.publicationStatus, availabilityStatus: row.availabilityStatus, featured: row.featured, image: row.media[0]?.thumbnailPath ?? row.media[0]?.path ?? "/media/destinations/ajuruteua.webp" }))} />;
}
