import { NextResponse, type NextRequest } from "next/server";
import { writeAudit } from "@/lib/admin/audit";
import { packageJson, packageRelationsData, packageScalarData } from "@/lib/admin/packages";
import { authenticateAdminRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { packageFormSchema } from "@/lib/validation/package";

export async function GET(request: NextRequest) {
  const session = await authenticateAdminRequest(request);
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });

  const query = request.nextUrl.searchParams.get("q")?.trim();
  const publicationStatus = request.nextUrl.searchParams.get("status");
  const archived = request.nextUrl.searchParams.get("archived") === "1";
  const packages = await prisma.package.findMany({
    where: {
      deletedAt: null,
      publicationStatus: archived ? "ARCHIVED" : publicationStatus && ["DRAFT", "PUBLISHED", "INACTIVE"].includes(publicationStatus) ? publicationStatus as "DRAFT" | "PUBLISHED" | "INACTIVE" : { not: "ARCHIVED" },
      ...(query ? { OR: [{ name: { contains: query } }, { city: { contains: query } }, { slug: { contains: query } }] } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { category: true, destination: true, media: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  return NextResponse.json({ packages: packageJson(packages) });
}

export async function POST(request: NextRequest) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Sessão inválida ou proteção CSRF ausente." }, { status: 401 });

  const parsed = packageFormSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revise os campos destacados.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });

  const duplicate = await prisma.package.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } });
  if (duplicate) return NextResponse.json({ error: "Já existe um pacote com este slug.", fields: { slug: ["Escolha outro endereço."] } }, { status: 409 });

  if (parsed.data.featured) {
    const [settings, count] = await Promise.all([
      prisma.companySettings.findUnique({ where: { singletonKey: "default" } }),
      prisma.package.count({ where: { featured: true, deletedAt: null, publicationStatus: { not: "ARCHIVED" } } }),
    ]);
    if (settings && count >= settings.maxFeaturedPackages) return NextResponse.json({ error: `O limite de ${settings.maxFeaturedPackages} pacotes em destaque foi atingido.` }, { status: 409 });
  }

  const relations = packageRelationsData(parsed.data);
  const created = await prisma.package.create({
    data: {
      ...packageScalarData(parsed.data),
      createdById: session.userId,
      updatedById: session.userId,
      includedItems: { create: relations.includedItems },
      excludedItems: { create: relations.excludedItems },
      itinerary: { create: relations.itinerary },
    },
    include: { category: true, destination: true, media: true, includedItems: true, excludedItems: true, itinerary: true },
  });
  await writeAudit({ adminUserId: session.userId, action: "PACKAGE_CREATED", entityType: "Package", entityId: created.id, summary: `${created.name} foi criado como ${created.publicationStatus.toLowerCase()}.`, afterState: created });
  return NextResponse.json({ package: packageJson(created) }, { status: 201 });
}
