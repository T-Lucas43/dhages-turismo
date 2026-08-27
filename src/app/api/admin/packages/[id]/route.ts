import { NextResponse, type NextRequest } from "next/server";
import { writeAudit } from "@/lib/admin/audit";
import { packageJson, packageRelationsData, packageScalarData } from "@/lib/admin/packages";
import { authenticateAdminRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { packageFormSchema } from "@/lib/validation/package";

const packageInclude = {
  category: true,
  destination: true,
  media: { orderBy: { sortOrder: "asc" as const } },
  includedItems: { orderBy: { sortOrder: "asc" as const } },
  excludedItems: { orderBy: { sortOrder: "asc" as const } },
  itinerary: { orderBy: { sortOrder: "asc" as const } },
};

export async function GET(request: NextRequest, context: RouteContext<"/api/admin/packages/[id]">) {
  const session = await authenticateAdminRequest(request);
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  const { id } = await context.params;
  const item = await prisma.package.findFirst({ where: { id, deletedAt: null }, include: packageInclude });
  if (!item) return NextResponse.json({ error: "Pacote não encontrado." }, { status: 404 });
  return NextResponse.json({ package: packageJson(item) });
}

export async function PATCH(request: NextRequest, context: RouteContext<"/api/admin/packages/[id]">) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Sessão inválida ou proteção CSRF ausente." }, { status: 401 });
  const { id } = await context.params;
  const before = await prisma.package.findFirst({ where: { id, deletedAt: null }, include: packageInclude });
  if (!before) return NextResponse.json({ error: "Pacote não encontrado." }, { status: 404 });

  const parsed = packageFormSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revise os campos destacados.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const slugOwner = await prisma.package.findFirst({ where: { slug: parsed.data.slug, id: { not: id } }, select: { id: true } });
  if (slugOwner) return NextResponse.json({ error: "Já existe um pacote com este slug.", fields: { slug: ["Escolha outro endereço."] } }, { status: 409 });

  if (parsed.data.featured && !before.featured) {
    const [settings, count] = await Promise.all([
      prisma.companySettings.findUnique({ where: { singletonKey: "default" } }),
      prisma.package.count({ where: { featured: true, deletedAt: null, publicationStatus: { not: "ARCHIVED" }, id: { not: id } } }),
    ]);
    if (settings && count >= settings.maxFeaturedPackages) return NextResponse.json({ error: `O limite de ${settings.maxFeaturedPackages} pacotes em destaque foi atingido.` }, { status: 409 });
  }

  const relations = packageRelationsData(parsed.data);
  const updated = await prisma.$transaction(async (transaction) => {
    await Promise.all([
      transaction.packageIncludedItem.deleteMany({ where: { packageId: id } }),
      transaction.packageExcludedItem.deleteMany({ where: { packageId: id } }),
      transaction.itineraryItem.deleteMany({ where: { packageId: id } }),
    ]);
    return transaction.package.update({
      where: { id },
      data: {
        ...packageScalarData(parsed.data),
        updatedById: session.userId,
        includedItems: { create: relations.includedItems },
        excludedItems: { create: relations.excludedItems },
        itinerary: { create: relations.itinerary },
      },
      include: packageInclude,
    });
  });
  await writeAudit({ adminUserId: session.userId, action: "PACKAGE_UPDATED", entityType: "Package", entityId: id, summary: `${updated.name} foi atualizado.`, beforeState: before, afterState: updated });
  return NextResponse.json({ package: packageJson(updated) });
}
