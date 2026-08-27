import { NextResponse, type NextRequest } from "next/server";
import { writeAudit } from "@/lib/admin/audit";
import { packageJson } from "@/lib/admin/packages";
import { authenticateAdminRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { storageProvider } from "@/lib/storage/local-storage-provider";
import { packageActionSchema } from "@/lib/validation/package";

function copiedSlug(slug: string) {
  return `${slug}-copia-${Date.now().toString(36)}`.slice(0, 191);
}

export async function POST(request: NextRequest, context: RouteContext<"/api/admin/packages/[id]/actions">) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Sessão inválida ou proteção CSRF ausente." }, { status: 401 });
  const parsed = packageActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  const { id } = await context.params;
  const item = await prisma.package.findFirst({
    where: { id, deletedAt: null },
    include: { media: true, includedItems: true, excludedItems: true, itinerary: true },
  });
  if (!item) return NextResponse.json({ error: "Pacote não encontrado." }, { status: 404 });

  if (parsed.data.action === "DELETE_PERMANENTLY") {
    if (parsed.data.confirmation !== item.name) return NextResponse.json({ error: "Digite o nome exato do pacote para confirmar a exclusão definitiva." }, { status: 400 });
    await prisma.package.delete({ where: { id } });
    const uploadedPaths = Array.from(new Set(item.media.flatMap((media) => [media.path, media.thumbnailPath, media.posterPath]).filter((path): path is string => typeof path === "string" && path.startsWith("/uploads/"))));
    await Promise.all(uploadedPaths.map(async (path) => {
      const references = await prisma.packageMedia.count({ where: { OR: [{ path }, { thumbnailPath: path }, { posterPath: path }] } });
      if (!references) await storageProvider.delete(path.replace(/^\/uploads\/?/, "")).catch(() => undefined);
    }));
    await writeAudit({ adminUserId: session.userId, action: "PACKAGE_DELETED", entityType: "Package", entityId: id, summary: `${item.name} foi excluído definitivamente.`, beforeState: item });
    return NextResponse.json({ deleted: true });
  }

  if (parsed.data.action === "DUPLICATE") {
    const { id: _id, slug, name, publicationStatus: _status, featured: _featured, featuredOrder: _featuredOrder, publishedAt: _publishedAt, createdAt: _createdAt, updatedAt: _updatedAt, createdById: _createdById, updatedById: _updatedById, deletedAt: _deletedAt, viewCount: _views, whatsappClickCount: _clicks, media, includedItems, excludedItems, itinerary, ...rest } = item;
    const duplicate = await prisma.package.create({
      data: {
        ...rest,
        name: `${name} — Cópia`,
        slug: copiedSlug(slug),
        publicationStatus: "DRAFT",
        featured: false,
        featuredOrder: null,
        featuredStartsAt: null,
        featuredEndsAt: null,
        publishedAt: null,
        createdById: session.userId,
        updatedById: session.userId,
        viewCount: 0,
        whatsappClickCount: 0,
        media: { create: media.map(({ id: _mediaId, packageId: _packageId, createdAt: _mediaCreated, updatedAt: _mediaUpdated, ...mediaData }) => mediaData) },
        includedItems: { create: includedItems.map(({ id: _includedId, packageId: _includedPackageId, ...data }) => data) },
        excludedItems: { create: excludedItems.map(({ id: _excludedId, packageId: _excludedPackageId, ...data }) => data) },
        itinerary: { create: itinerary.map(({ id: _itineraryId, packageId: _itineraryPackageId, ...data }) => data) },
      },
    });
    await writeAudit({ adminUserId: session.userId, action: "PACKAGE_DUPLICATED", entityType: "Package", entityId: duplicate.id, summary: `${item.name} foi duplicado como rascunho.` });
    return NextResponse.json({ package: packageJson(duplicate) }, { status: 201 });
  }

  if (parsed.data.action === "FEATURE" && !item.featured) {
    const [settings, featuredCount] = await Promise.all([
      prisma.companySettings.findUnique({ where: { singletonKey: "default" } }),
      prisma.package.count({ where: { featured: true, deletedAt: null, publicationStatus: { not: "ARCHIVED" }, id: { not: id } } }),
    ]);
    if (settings && featuredCount >= settings.maxFeaturedPackages) return NextResponse.json({ error: `O limite de ${settings.maxFeaturedPackages} pacotes em destaque foi atingido.` }, { status: 409 });
  }

  const updateMap = {
    PUBLISH: { publicationStatus: "PUBLISHED" as const, publishedAt: item.publishedAt ?? new Date() },
    UNPUBLISH: { publicationStatus: "DRAFT" as const },
    INACTIVATE: { publicationStatus: "INACTIVE" as const },
    ARCHIVE: { publicationStatus: "ARCHIVED" as const, featured: false, featuredOrder: null },
    RESTORE: { publicationStatus: "DRAFT" as const },
    FEATURE: { featured: true },
    UNFEATURE: { featured: false, featuredOrder: null },
    AVAILABLE: { availabilityStatus: "AVAILABLE" as const },
    FEW_SPOTS: { availabilityStatus: "FEW_SPOTS" as const },
    SOLD_OUT: { availabilityStatus: "SOLD_OUT" as const },
    CANCELLED: { availabilityStatus: "CANCELLED" as const },
  };
  const updated = await prisma.package.update({ where: { id }, data: { ...updateMap[parsed.data.action], updatedById: session.userId } });
  await writeAudit({ adminUserId: session.userId, action: `PACKAGE_${parsed.data.action}`, entityType: "Package", entityId: id, summary: `${item.name}: ação ${parsed.data.action.toLowerCase()} concluída.`, beforeState: item, afterState: updated });
  return NextResponse.json({ package: packageJson(updated) });
}
