import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PackageEditor, type PackageEditorInitial } from "@/components/admin/package-editor";
import { prisma } from "@/lib/prisma";

export default async function EditPackagePage({ params }: PageProps<"/admin/pacotes/[id]/editar">) {
  const { id } = await params;
  const [item, categories, destinations] = await Promise.all([
    prisma.package.findFirst({
      where: { id, deletedAt: null },
      include: {
        media: { orderBy: { sortOrder: "asc" } },
        includedItems: { orderBy: { sortOrder: "asc" } },
        excludedItems: { orderBy: { sortOrder: "asc" } },
        itinerary: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.packageCategory.findMany({ where: { active: true, deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    prisma.destination.findMany({ where: { active: true, deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, city: true, state: true, stateCode: true } }),
  ]);
  if (!item) notFound();

  const initialData: PackageEditorInitial = {
    id: item.id,
    name: item.name,
    slug: item.slug,
    summary: item.summary,
    description: item.description,
    categoryId: item.categoryId,
    destinationId: item.destinationId,
    city: item.city,
    state: item.state,
    stateCode: item.stateCode,
    departureAt: item.departureAt.toISOString(),
    returnAt: item.returnAt.toISOString(),
    boardingTime: item.boardingTime,
    boardingLocation: item.boardingLocation,
    durationDays: item.durationDays,
    cashPrice: item.cashPrice.toString(),
    installmentCount: item.installmentCount,
    installmentValue: item.installmentValue?.toString() ?? null,
    installmentTotal: item.installmentTotal?.toString() ?? null,
    totalSpots: item.totalSpots,
    remainingSpots: item.remainingSpots,
    showSpots: item.showSpots,
    accommodation: item.accommodation,
    transport: item.transport,
    meals: item.meals,
    guide: item.guide,
    childPolicy: item.childPolicy,
    requiredDocuments: item.requiredDocuments,
    paymentMethods: item.paymentMethods,
    importantNotes: item.importantNotes,
    mapUrl: item.mapUrl,
    publicationStatus: item.publicationStatus,
    availabilityStatus: item.availabilityStatus,
    featured: item.featured,
    featuredOrder: item.featuredOrder,
    featuredStartsAt: item.featuredStartsAt?.toISOString() ?? null,
    featuredEndsAt: item.featuredEndsAt?.toISOString() ?? null,
    waitingListEnabled: item.waitingListEnabled,
    publishedAt: item.publishedAt?.toISOString() ?? null,
    publicationEndsAt: item.publicationEndsAt?.toISOString() ?? null,
    seoTitle: item.seoTitle,
    seoDescription: item.seoDescription,
    shareImagePath: item.shareImagePath,
    includedItems: item.includedItems.map(({ text }) => ({ text })),
    excludedItems: item.excludedItems.map(({ text }) => ({ text })),
    itinerary: item.itinerary.map(({ dayNumber, time, title, details }) => ({ dayNumber, time, title, details })),
    media: item.media.map(({ id: mediaId, type, path, thumbnailPath, posterPath, altText, isCover, isPreview, sortOrder }) => ({ id: mediaId, type, path, thumbnailPath, posterPath, altText, isCover, isPreview, sortOrder })),
  };

  return <div className="admin-content editor-content">
    <Link className="editor-back" href="/admin/pacotes"><ArrowLeft /> Voltar para pacotes</Link>
    <div className="editor-title"><div><span>Editar pacote</span><h1>{item.name}</h1><p>Atualize dados, mídias, SEO e o estado de publicação.</p></div><span className={`draft-badge status-${item.publicationStatus.toLowerCase()}`}>{item.publicationStatus === "PUBLISHED" ? "Publicado" : item.publicationStatus === "DRAFT" ? "Rascunho" : item.publicationStatus === "INACTIVE" ? "Inativo" : "Arquivado"}</span></div>
    <PackageEditor categories={categories} destinations={destinations} initialData={initialData} />
  </div>;
}
