import "dotenv/config";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { hash } from "argon2";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { databaseAdapterUrl } from "../src/lib/database-url";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL não configurada.");

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseAdapterUrl(databaseUrl)) });

const categorySeed = [
  ["Praias & ilhas", "praias-ilhas", "Roteiros de sol, mar, rios e ilhas."],
  ["Natureza", "natureza", "Experiências de contemplação e ecoturismo."],
  ["Aventura", "aventura", "Trilhas, cachoeiras e atividades ao ar livre."],
  ["Bate e volta", "bate-e-volta", "Passeios de um dia saindo de Belém."],
] as const;

const destinationSeed = [
  { name: "Ajuruteua", slug: "ajuruteua-pa", city: "Bragança", state: "Pará", stateCode: "PA", coverPath: "/media/destinations/ajuruteua.webp" },
  { name: "Bragança", slug: "braganca-pa", city: "Bragança", state: "Pará", stateCode: "PA", coverPath: "/media/destinations/mosqueiro.webp" },
  { name: "Ilha do Mosqueiro", slug: "mosqueiro-pa", city: "Belém", state: "Pará", stateCode: "PA", coverPath: "/media/destinations/alter-do-chao.webp" },
  { name: "Carolina", slug: "carolina-ma", city: "Carolina", state: "Maranhão", stateCode: "MA", coverPath: "/media/destinations/chapada-das-mesas.webp" },
  { name: "Salinas", slug: "salinopolis-pa", city: "Salinópolis", state: "Pará", stateCode: "PA", coverPath: "/media/destinations/salinas.webp" },
] as const;

async function main() {
  const configuredPassword = process.env.ADMIN_INITIAL_PASSWORD;
  const initialPassword = configuredPassword || randomBytes(18).toString("base64url");
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL ?? "admin@dhages.local";
  const passwordHash = await hash(initialPassword, { type: 2, memoryCost: 19456, timeCost: 3, parallelism: 1 });

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { name: process.env.ADMIN_INITIAL_NAME ?? "Administrador D’Hages", passwordHash, active: true, failedLoginCount: 0, lockedUntil: null },
    create: { name: process.env.ADMIN_INITIAL_NAME ?? "Administrador D’Hages", email: adminEmail.toLowerCase(), passwordHash, role: "OWNER" },
  });

  if (!configuredPassword) {
    const credentialDir = resolve("storage");
    await mkdir(credentialDir, { recursive: true });
    await writeFile(resolve(credentialDir, "dev-admin-credentials.txt"), `E-mail: ${adminEmail}\nSenha: ${initialPassword}\n`, { encoding: "utf8", mode: 0o600 });
  }

  await prisma.companySettings.upsert({
    where: { singletonKey: "default" },
    update: {},
    create: {
      singletonKey: "default",
      companyName: "D’Hages Turismo",
      city: "Belém",
      state: "Pará",
      phonePrimary: "(91) 99215-2727",
      phoneSecondary: "(91) 98114-9800",
      whatsappNumber: "5591992152727",
      instagramHandle: "@dhages_turismo",
      address: "Av. Senador Lemos, 3153, lojas 30/31, 1º piso, IT Center – Sacramento, Belém/PA",
      businessHours: "Segunda a sexta, das 9h às 18h · Sábado, das 9h às 13h",
      aboutTitle: "Turismo feito com cuidado e afeto",
      aboutText: "Somos de Belém e criamos roteiros acolhedores, seguros e bem acompanhados.",
      mission: "Aproximar pessoas de experiências marcantes por meio de viagens bem cuidadas.",
      vision: "Ser referência em turismo acolhedor e responsável na região Norte.",
      valuesText: "Transparência, segurança, respeito, atenção e paixão por servir.",
      logoDarkPath: "/brand/logo.webp",
      logoLightPath: "/brand/logo.webp",
    },
  });

  const categories = new Map<string, string>();
  for (let index = 0; index < categorySeed.length; index += 1) {
    const [name, slug, description] = categorySeed[index];
    const category = await prisma.packageCategory.upsert({
      where: { slug },
      update: { name, description, active: true, sortOrder: index },
      create: { name, slug, description, active: true, sortOrder: index },
    });
    categories.set(slug, category.id);
  }

  const destinations = new Map<string, string>();
  for (let index = 0; index < destinationSeed.length; index += 1) {
    const item = destinationSeed[index];
    const destination = await prisma.destination.upsert({
      where: { slug: item.slug },
      update: { ...item, active: true, sortOrder: index },
      create: { ...item, active: true, sortOrder: index, description: `Conheça ${item.name} com a D’Hages Turismo.` },
    });
    destinations.set(item.slug, destination.id);
  }

  const packageSeeds = [
    {
      name: "Ajuruteua — PA", slug: "ajuruteua-pa", summary: "Areia clara, mar aberto e uma experiência leve no litoral paraense.", description: "Um roteiro completo para aproveitar Ajuruteua com transporte, hospedagem e acompanhamento da equipe D’Hages.", category: "praias-ilhas", destination: "ajuruteua-pa", city: "Bragança", state: "Pará", stateCode: "PA", departureAt: new Date("2026-09-23T09:00:00-03:00"), returnAt: new Date("2026-09-24T19:00:00-03:00"), durationDays: 2, cashPrice: "489.00", installmentCount: 6, installmentValue: "86.50", installmentTotal: "519.00", totalSpots: 40, remainingSpots: 4, availabilityStatus: "FEW_SPOTS" as const, featured: true, featuredOrder: 1, waitingListEnabled: true,
    },
    {
      name: "Bragança, Ajuruteua & Ville Acqua Park", slug: "braganca-ajuruteua-ville-acqua-park", summary: "Cultura, praia e diversão em um roteiro que combina três experiências.", description: "Conheça Bragança, aproveite Ajuruteua e reserve um dia para o Ville Acqua Park com suporte da nossa equipe.", category: "praias-ilhas", destination: "braganca-pa", city: "Bragança", state: "Pará", stateCode: "PA", departureAt: new Date("2026-10-10T06:00:00-03:00"), returnAt: new Date("2026-10-12T20:00:00-03:00"), durationDays: 3, cashPrice: "799.00", installmentCount: 8, installmentValue: "108.00", installmentTotal: "864.00", totalSpots: 44, remainingSpots: 18, availabilityStatus: "AVAILABLE" as const, featured: true, featuredOrder: 2, waitingListEnabled: false,
    },
    {
      name: "Mosqueiro — Feriado", slug: "mosqueiro-feriado", summary: "Um dia inteiro para curtir a ilha com embarque organizado em Belém.", description: "Bate e volta para a Ilha do Mosqueiro com transporte executivo e acompanhamento da equipe.", category: "bate-e-volta", destination: "mosqueiro-pa", city: "Belém", state: "Pará", stateCode: "PA", departureAt: new Date("2026-11-15T06:00:00-03:00"), returnAt: new Date("2026-11-15T21:00:00-03:00"), durationDays: 1, cashPrice: "189.00", installmentCount: 3, installmentValue: "66.00", installmentTotal: "198.00", totalSpots: 44, remainingSpots: 0, availabilityStatus: "SOLD_OUT" as const, featured: false, featuredOrder: null, waitingListEnabled: true,
    },
    {
      name: "Carolina — Chapada das Mesas", slug: "carolina-chapada-das-mesas", summary: "Cachoeiras, trilhas e paisagens grandiosas em um roteiro acompanhado.", description: "Cinco dias para viver a Chapada das Mesas com hospedagem, transporte e experiências selecionadas.", category: "aventura", destination: "carolina-ma", city: "Carolina", state: "Maranhão", stateCode: "MA", departureAt: new Date("2026-09-10T05:00:00-03:00"), returnAt: new Date("2026-09-14T22:00:00-03:00"), durationDays: 5, cashPrice: "1490.00", installmentCount: 10, installmentValue: "165.00", installmentTotal: "1650.00", totalSpots: 32, remainingSpots: 12, availabilityStatus: "AVAILABLE" as const, featured: true, featuredOrder: 3, waitingListEnabled: false,
    },
    {
      name: "Salinas — Verão paraense", slug: "salinas-verao-paraense", summary: "Praia, gastronomia e dias leves na costa atlântica do Pará.", description: "Um fim de semana em Salinópolis com roteiro flexível, hospedagem e suporte próximo.", category: "praias-ilhas", destination: "salinopolis-pa", city: "Salinópolis", state: "Pará", stateCode: "PA", departureAt: new Date("2026-12-05T06:00:00-03:00"), returnAt: new Date("2026-12-07T20:00:00-03:00"), durationDays: 3, cashPrice: "899.00", installmentCount: 8, installmentValue: "121.00", installmentTotal: "968.00", totalSpots: 40, remainingSpots: 25, availabilityStatus: "AVAILABLE" as const, featured: false, featuredOrder: null, waitingListEnabled: false,
    },
  ];

  const galleryImages = [
    "/media/destinations/ajuruteua.webp",
    "/media/destinations/alter-do-chao.webp",
    "/media/destinations/chapada-das-mesas.webp",
  ];

  for (const [index, item] of packageSeeds.entries()) {
    const categoryId = categories.get(item.category);
    const destinationId = destinations.get(item.destination);
    if (!categoryId || !destinationId) throw new Error(`Seed incompleto para ${item.slug}.`);

    const travelPackage = await prisma.package.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name, summary: item.summary, description: item.description, categoryId, destinationId, city: item.city, state: item.state, stateCode: item.stateCode,
        departureAt: item.departureAt, returnAt: item.returnAt, durationDays: item.durationDays, cashPrice: item.cashPrice, installmentCount: item.installmentCount,
        installmentValue: item.installmentValue, installmentTotal: item.installmentTotal, totalSpots: item.totalSpots, remainingSpots: item.remainingSpots,
        availabilityStatus: item.availabilityStatus, featured: item.featured, featuredOrder: item.featuredOrder, waitingListEnabled: item.waitingListEnabled,
        publicationStatus: "PUBLISHED", publishedAt: new Date("2026-08-01T09:00:00-03:00"), updatedById: admin.id,
      },
      create: {
        name: item.name, slug: item.slug, summary: item.summary, description: item.description, categoryId, destinationId, city: item.city, state: item.state, stateCode: item.stateCode,
        departureAt: item.departureAt, returnAt: item.returnAt, boardingTime: "06:00", boardingLocation: "Belém — ponto informado antes da viagem", durationDays: item.durationDays,
        cashPrice: item.cashPrice, installmentCount: item.installmentCount, installmentValue: item.installmentValue, installmentTotal: item.installmentTotal,
        totalSpots: item.totalSpots, remainingSpots: item.remainingSpots, showSpots: true, accommodation: "Hospedagem conforme categoria do pacote.", transport: "Transporte executivo climatizado.",
        meals: "Café da manhã quando indicado no roteiro.", guide: "Equipe D’Hages Turismo", childPolicy: "Consulte condições por faixa etária.", requiredDocuments: "Documento oficial com foto.",
        paymentMethods: "Pix, cartão e transferência, conforme condições do pacote.", publicationStatus: "PUBLISHED", availabilityStatus: item.availabilityStatus,
        featured: item.featured, featuredOrder: item.featuredOrder, waitingListEnabled: item.waitingListEnabled, publishedAt: new Date("2026-08-01T09:00:00-03:00"),
        seoTitle: item.name, seoDescription: item.summary, createdById: admin.id, updatedById: admin.id,
        media: {
          create: galleryImages.map((path, mediaIndex) => ({ type: "IMAGE", path, thumbnailPath: path, altText: `${item.name} — imagem ${mediaIndex + 1}`, mimeType: "image/jpeg", sizeBytes: 0, isCover: mediaIndex === 0, sortOrder: mediaIndex })),
        },
        includedItems: { create: [{ text: "Transporte ida e volta", sortOrder: 0 }, { text: "Acompanhamento da equipe", sortOrder: 1 }, { text: "Hospedagem conforme o roteiro", sortOrder: 2 }] },
        excludedItems: { create: [{ text: "Despesas pessoais", sortOrder: 0 }, { text: "Refeições não mencionadas", sortOrder: 1 }] },
        itinerary: { create: [{ dayNumber: 1, title: "Partida e boas-vindas", details: "Embarque, recepção da equipe e início das atividades.", sortOrder: 0 }, { dayNumber: item.durationDays, title: "Últimas experiências e retorno", details: "Programação final e retorno para Belém.", sortOrder: 1 }] },
      },
    });
    if (index === 0) {
      const previewVideo = await prisma.packageMedia.findFirst({ where: { packageId: travelPackage.id, type: "VIDEO", path: "/media/hero-amazonia.mp4" } });
      if (!previewVideo) await prisma.packageMedia.create({ data: { packageId: travelPackage.id, type: "VIDEO", path: "/media/hero-amazonia.mp4", thumbnailPath: "/media/hero-amazonia-poster.webp", posterPath: "/media/hero-amazonia-poster.webp", altText: "Vista aérea da Amazônia em Full HD", mimeType: "video/mp4", sizeBytes: 8_647_133, width: 1920, height: 1080, isPreview: true, sortOrder: 10 } });
    }
  }

  const faqSeed = [
    ["Como faço para reservar?", "Fale com nossa equipe pelo WhatsApp. Confirmaremos disponibilidade e condições de pagamento."],
    ["Posso parcelar?", "Sim. Cada pacote informa o número de parcelas e o valor total parcelado."],
    ["O que preciso levar?", "Enviamos uma lista antes da viagem, além dos documentos necessários informados no pacote."],
  ] as const;

  for (let index = 0; index < faqSeed.length; index += 1) {
    const [question, answer] = faqSeed[index];
    const existing = await prisma.faq.findFirst({ where: { question, scope: "GENERAL" } });
    if (!existing) await prisma.faq.create({ data: { scope: "GENERAL", question, answer, active: true, sortOrder: index } });
  }

  const testimonial = await prisma.testimonial.findFirst({ where: { name: "Mariana Souza" } });
  if (!testimonial) await prisma.testimonial.create({ data: { name: "Mariana Souza", destination: "Carolina — MA", quote: "A equipe cuidou de tudo e fez a gente se sentir em casa. Foi a melhor escolha para conhecer a Chapada!", rating: 5, active: true, sortOrder: 0, publishedAt: new Date() } });

  await prisma.auditLog.create({ data: { adminUserId: admin.id, action: "SEED_COMPLETED", entityType: "System", summary: "Dados iniciais de desenvolvimento verificados." } });
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exitCode = 1; });
