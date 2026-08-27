import { NextResponse, type NextRequest } from "next/server";
import { writeAudit } from "@/lib/admin/audit";
import { authenticateAdminRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { contentSchemas, type ContentEntity } from "@/lib/validation/content";

const validEntities = new Set<ContentEntity>(["categorias", "destinos", "depoimentos", "perguntas", "galeria"]);

export async function GET(request: NextRequest, context: RouteContext<"/api/admin/content/[entity]">) {
  const session = await authenticateAdminRequest(request);
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  const { entity: rawEntity } = await context.params;
  if (!validEntities.has(rawEntity as ContentEntity)) return NextResponse.json({ error: "Cadastro inválido." }, { status: 404 });
  const entity = rawEntity as ContentEntity;
  const records = entity === "categorias" ? await prisma.packageCategory.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] })
    : entity === "destinos" ? await prisma.destination.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] })
      : entity === "depoimentos" ? await prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] })
        : entity === "perguntas" ? await prisma.faq.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] })
          : await prisma.galleryItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ records });
}

export async function POST(request: NextRequest, context: RouteContext<"/api/admin/content/[entity]">) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Sessão inválida ou proteção CSRF ausente." }, { status: 401 });
  const { entity: rawEntity } = await context.params;
  if (!validEntities.has(rawEntity as ContentEntity)) return NextResponse.json({ error: "Cadastro inválido." }, { status: 404 });
  const entity = rawEntity as ContentEntity;
  const parsed = contentSchemas[entity].safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revise os campos do cadastro.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    let record;
    if (entity === "categorias") record = await prisma.packageCategory.create({ data: contentSchemas.categorias.parse(parsed.data) });
    else if (entity === "destinos") record = await prisma.destination.create({ data: contentSchemas.destinos.parse(parsed.data) });
    else if (entity === "depoimentos") record = await prisma.testimonial.create({ data: { ...contentSchemas.depoimentos.parse(parsed.data), publishedAt: new Date() } });
    else if (entity === "perguntas") {
      const data = contentSchemas.perguntas.parse(parsed.data);
      record = await prisma.faq.create({ data: { ...data, packageId: data.scope === "PACKAGE" ? data.packageId : null } });
    } else record = await prisma.galleryItem.create({ data: contentSchemas.galeria.parse(parsed.data) });
    await writeAudit({ adminUserId: session.userId, action: "CONTENT_CREATED", entityType: entity, entityId: record.id, summary: `Novo registro criado em ${entity}.`, afterState: record });
    return NextResponse.json({ record }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível criar. Verifique se nome ou slug já estão em uso." }, { status: 409 });
  }
}
