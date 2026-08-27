import { company, packages as demoPackages, type TravelPackage } from "@/data/demo";
import { isFrontendOnly } from "@/lib/env";
import { publicPackageWhere } from "@/lib/packages/visibility";
import { prisma } from "@/lib/prisma";

export type PublicCompany = {
  name: string;
  city: string;
  state: string;
  phones: string[];
  whatsapp: string;
  instagram: string;
  address: string;
  hours: string;
  mapEmbedUrl: string | null;
  aboutTitle: string;
  aboutText: string;
  mission: string;
  vision: string;
  valuesText: string;
};

const demoCompany: PublicCompany = {
  name: company.name,
  city: "Belém",
  state: "Pará",
  phones: company.phones,
  whatsapp: company.whatsapp,
  instagram: company.instagram,
  address: company.address,
  hours: company.hours,
  mapEmbedUrl: null,
  aboutTitle: "Turismo feito com cuidado e afeto",
  aboutText: "Somos de Belém e criamos roteiros acolhedores, seguros e bem acompanhados.",
  mission: "Aproximar pessoas de experiências marcantes por meio de viagens bem cuidadas.",
  vision: "Ser referência em turismo acolhedor e responsável na região Norte.",
  valuesText: "Transparência, segurança, respeito, atenção e paixão por servir.",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export async function getPublicCompany(): Promise<PublicCompany> {
  if (isFrontendOnly) return demoCompany;
  const settings = await prisma.companySettings.findUnique({ where: { singletonKey: "default" } });
  if (!settings) return demoCompany;
  return {
    name: settings.companyName,
    city: settings.city,
    state: settings.state,
    phones: [settings.phonePrimary, settings.phoneSecondary].filter((value): value is string => Boolean(value)),
    whatsapp: settings.whatsappNumber,
    instagram: settings.instagramHandle ?? "",
    address: settings.address,
    hours: settings.businessHours ?? "",
    mapEmbedUrl: settings.mapEmbedUrl,
    aboutTitle: settings.aboutTitle ?? demoCompany.aboutTitle,
    aboutText: settings.aboutText ?? demoCompany.aboutText,
    mission: settings.mission ?? demoCompany.mission,
    vision: settings.vision ?? demoCompany.vision,
    valuesText: settings.valuesText ?? demoCompany.valuesText,
  };
}

export async function getPublicPackages(): Promise<TravelPackage[]> {
  if (isFrontendOnly) return demoPackages;
  const settings = await getPublicCompany();
  const records = await prisma.package.findMany({
    where: publicPackageWhere(),
    orderBy: [{ featured: "desc" }, { featuredOrder: "asc" }, { departureAt: "asc" }],
    include: { category: { select: { name: true, slug: true } }, destination: { select: { name: true, slug: true } }, media: { orderBy: { sortOrder: "asc" } } },
  });
  return records.map((item) => {
    const cover = item.media.find((media) => media.isCover && media.type === "IMAGE") ?? item.media.find((media) => media.type === "IMAGE");
    const preview = item.media.find((media) => media.isPreview && media.type === "VIDEO");
    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      destination: item.destination.name,
      destinationSlug: item.destination.slug,
      city: item.city,
      state: item.state,
      stateCode: item.stateCode,
      category: item.category.name,
      categorySlug: item.category.slug,
      departure: dateFormatter.format(item.departureAt),
      departureIso: item.departureAt.toISOString(),
      returnDate: dateFormatter.format(item.returnAt),
      duration: `${item.durationDays} dia${item.durationDays === 1 ? "" : "s"}`,
      durationDays: item.durationDays,
      price: Number(item.cashPrice),
      installments: item.installmentValue ? `${item.installmentCount}x de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(item.installmentValue))}` : `até ${item.installmentCount}x`,
      image: cover?.path ?? cover?.thumbnailPath ?? "/media/destinations/ajuruteua.webp",
      availability: item.availabilityStatus,
      featured: item.featured,
      summary: item.summary,
      previewVideo: preview?.path,
      videoPoster: preview?.posterPath ?? preview?.thumbnailPath ?? cover?.path,
      waitingListEnabled: item.waitingListEnabled,
      whatsappNumber: settings.whatsapp,
    };
  });
}

export async function getPublicDestinations() {
  if (isFrontendOnly) return demoPackages.map((item) => ({ id: item.slug, name: item.destination, slug: item.destinationSlug ?? item.destination, state: item.state, stateCode: item.state === "Pará" ? "PA" : "MA", coverPath: item.image, packageCount: 1 })).filter((item, index, all) => all.findIndex((candidate) => candidate.name === item.name) === index);
  const records = await prisma.destination.findMany({ where: { active: true, deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { packages: { where: publicPackageWhere(), select: { id: true }, take: 100 } } });
  return records.filter((item) => item.packages.length > 0).map((item) => ({ id: item.id, name: item.name, slug: item.slug, state: item.state, stateCode: item.stateCode, coverPath: item.coverPath ?? "/media/destinations/ajuruteua.webp", packageCount: item.packages.length }));
}

export async function getPublicHomeContent() {
  if (isFrontendOnly) return {
    categories: [{ name: "Praias & ilhas", slug: "praias-ilhas", count: 2 }, { name: "Natureza", slug: "natureza", count: 1 }, { name: "Aventura", slug: "aventura", count: 1 }, { name: "Bate e volta", slug: "bate-e-volta", count: 1 }],
    testimonial: { name: "Mariana Souza", destination: "Carolina — MA", quote: "A equipe cuidou de tudo e fez a gente se sentir em casa. Foi a melhor escolha para conhecer a Chapada!", rating: 5 },
    gallery: demoPackages.slice(0, 3).map((item) => ({ id: item.slug, title: item.destination, path: item.image, mediaType: "IMAGE" as const, altText: `Viagem para ${item.destination}` })),
    faqs: [{ id: "reserva", question: "Como faço para reservar?", answer: "Fale com nossa equipe pelo WhatsApp. Confirmaremos disponibilidade e condições de pagamento." }],
  };
  const now = new Date();
  const [categories, testimonial, gallery, faqs] = await Promise.all([
    prisma.packageCategory.findMany({ where: { active: true, deletedAt: null }, orderBy: { sortOrder: "asc" }, include: { _count: { select: { packages: { where: publicPackageWhere(now) } } } } }),
    prisma.testimonial.findFirst({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }] }),
    prisma.galleryItem.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
    prisma.faq.findMany({ where: { active: true, scope: "GENERAL" }, orderBy: { sortOrder: "asc" }, take: 8 }),
  ]);
  return {
    categories: categories.map((item) => ({ name: item.name, slug: item.slug, count: item._count.packages })),
    testimonial: testimonial ? { name: testimonial.name, destination: testimonial.destination ?? "Viajante D’Hages", quote: testimonial.quote, rating: testimonial.rating } : null,
    gallery: gallery.map(({ id, title, path, mediaType, altText }) => ({ id, title, path, mediaType, altText })),
    faqs: faqs.map(({ id, question, answer }) => ({ id, question, answer })),
  };
}

export type PublicPackageDetail = TravelPackage & {
  description: string;
  city: string;
  stateCode: string;
  departureIso: string;
  returnIso: string;
  boardingTime: string | null;
  boardingLocation: string | null;
  installmentValue: number | null;
  installmentTotal: number | null;
  totalSpots: number | null;
  remainingSpots: number | null;
  showSpots: boolean;
  accommodation: string | null;
  transport: string | null;
  meals: string | null;
  guide: string | null;
  childPolicy: string | null;
  requiredDocuments: string | null;
  paymentMethods: string | null;
  importantNotes: string | null;
  mapUrl: string | null;
  includedItems: string[];
  excludedItems: string[];
  itinerary: Array<{ id: string; dayNumber: number | null; time: string | null; title: string; details: string }>;
  media: Array<{ id: string; type: "IMAGE" | "VIDEO"; path: string; thumbnailPath: string | null; posterPath: string | null; altText: string | null }>;
  faqs: Array<{ id: string; question: string; answer: string }>;
  seoTitle: string | null;
  seoDescription: string | null;
  shareImagePath: string | null;
};

export async function getPublicPackageBySlug(slug: string, countView = false): Promise<PublicPackageDetail | null> {
  if (isFrontendOnly) {
    const item = demoPackages.find((entry) => entry.slug === slug);
    if (!item) return null;
    return { ...item, id: item.slug, city: item.destination, stateCode: item.state === "Pará" ? "PA" : "MA", departureIso: new Date().toISOString(), returnIso: new Date().toISOString(), description: item.summary, boardingTime: "06:00", boardingLocation: "Belém", installmentValue: null, installmentTotal: null, totalSpots: null, remainingSpots: null, showSpots: false, accommodation: "Hospedagem conforme o roteiro.", transport: "Transporte executivo climatizado.", meals: "Conforme programação.", guide: "Equipe D’Hages Turismo", childPolicy: "Consulte a equipe.", requiredDocuments: "Documento oficial com foto.", paymentMethods: "Pix e cartão.", importantNotes: "Siga as orientações enviadas antes do embarque.", mapUrl: null, includedItems: ["Transporte ida e volta", "Acompanhamento da equipe", "Hospedagem conforme o roteiro"], excludedItems: ["Despesas pessoais", "Refeições não mencionadas"], itinerary: [{ id: "dia-1", dayNumber: 1, time: null, title: "Partida e boas-vindas", details: "Embarque, recepção da equipe e início das atividades." }], media: [{ id: "capa", type: "IMAGE", path: item.image, thumbnailPath: item.image, posterPath: null, altText: `Paisagem de ${item.destination}` }], faqs: [], seoTitle: item.name, seoDescription: item.summary, shareImagePath: item.image };
  }
  const record = await prisma.package.findFirst({
    where: { slug, ...publicPackageWhere() },
    include: {
      category: { select: { name: true, slug: true } },
      destination: { select: { name: true, slug: true } },
      media: { orderBy: { sortOrder: "asc" } },
      includedItems: { orderBy: { sortOrder: "asc" } },
      excludedItems: { orderBy: { sortOrder: "asc" } },
      itinerary: { orderBy: { sortOrder: "asc" } },
      faqs: { where: { active: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!record) return null;
  const settings = await getPublicCompany();
  if (countView) await prisma.package.update({ where: { id: record.id }, data: { viewCount: { increment: 1 } } });
  const cover = record.media.find((media) => media.isCover && media.type === "IMAGE") ?? record.media.find((media) => media.type === "IMAGE");
  const preview = record.media.find((media) => media.isPreview && media.type === "VIDEO");
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    destination: record.destination.name,
    destinationSlug: record.destination.slug,
    city: record.city,
    state: record.state,
    stateCode: record.stateCode,
    category: record.category.name,
    categorySlug: record.category.slug,
    departure: dateFormatter.format(record.departureAt),
    departureIso: record.departureAt.toISOString(),
    returnDate: dateFormatter.format(record.returnAt),
    returnIso: record.returnAt.toISOString(),
    duration: `${record.durationDays} dia${record.durationDays === 1 ? "" : "s"}`,
    durationDays: record.durationDays,
    price: Number(record.cashPrice),
    installments: record.installmentValue ? `${record.installmentCount}x de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(record.installmentValue))}` : `até ${record.installmentCount}x`,
    installmentValue: record.installmentValue ? Number(record.installmentValue) : null,
    installmentTotal: record.installmentTotal ? Number(record.installmentTotal) : null,
    image: cover?.path ?? "/media/destinations/ajuruteua.webp",
    previewVideo: preview?.path,
    videoPoster: preview?.posterPath ?? preview?.thumbnailPath ?? cover?.path,
    availability: record.availabilityStatus,
    featured: record.featured,
    summary: record.summary,
    description: record.description,
    boardingTime: record.boardingTime,
    boardingLocation: record.boardingLocation,
    totalSpots: record.totalSpots,
    remainingSpots: record.remainingSpots,
    showSpots: record.showSpots,
    accommodation: record.accommodation,
    transport: record.transport,
    meals: record.meals,
    guide: record.guide,
    childPolicy: record.childPolicy,
    requiredDocuments: record.requiredDocuments,
    paymentMethods: record.paymentMethods,
    importantNotes: record.importantNotes,
    mapUrl: record.mapUrl,
    waitingListEnabled: record.waitingListEnabled,
    whatsappNumber: settings.whatsapp,
    includedItems: record.includedItems.map((item) => item.text),
    excludedItems: record.excludedItems.map((item) => item.text),
    itinerary: record.itinerary.map(({ id, dayNumber, time, title, details }) => ({ id, dayNumber, time, title, details })),
    media: record.media.map(({ id, type, path, thumbnailPath, posterPath, altText }) => ({ id, type, path, thumbnailPath, posterPath, altText })),
    faqs: record.faqs.map(({ id, question, answer }) => ({ id, question, answer })),
    seoTitle: record.seoTitle,
    seoDescription: record.seoDescription,
    shareImagePath: record.shareImagePath,
  };
}
