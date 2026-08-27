import { NextResponse, type NextRequest } from "next/server";
import { writeAudit } from "@/lib/admin/audit";
import { authenticateAdminRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { contentSchemas, type ContentEntity } from "@/lib/validation/content";

const validEntities = new Set<ContentEntity>(["categorias", "destinos", "depoimentos", "perguntas", "galeria"]);

export async function PATCH(request: NextRequest, context: RouteContext<"/api/admin/content/[entity]/[id]">) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  const { entity: rawEntity, id } = await context.params;
  if (!validEntities.has(rawEntity as ContentEntity)) return NextResponse.json({ error: "Cadastro inválido." }, { status: 404 });
  const entity = rawEntity as ContentEntity;
  const parsed = contentSchemas[entity].safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revise os campos do cadastro.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    let record;
    if (entity === "categorias") record = await prisma.packageCategory.update({ where: { id }, data: contentSchemas.categorias.parse(parsed.data) });
    else if (entity === "destinos") record = await prisma.destination.update({ where: { id }, data: contentSchemas.destinos.parse(parsed.data) });
    else if (entity === "depoimentos") record = await prisma.testimonial.update({ where: { id }, data: contentSchemas.depoimentos.parse(parsed.data) });
    else if (entity === "perguntas") {
      const data = contentSchemas.perguntas.parse(parsed.data);
      record = await prisma.faq.update({ where: { id }, data: { ...data, packageId: data.scope === "PACKAGE" ? data.packageId : null } });
    } else record = await prisma.galleryItem.update({ where: { id }, data: contentSchemas.galeria.parse(parsed.data) });
    await writeAudit({ adminUserId: session.userId, action: "CONTENT_UPDATED", entityType: entity, entityId: id, summary: `Registro atualizado em ${entity}.`, afterState: record });
    return NextResponse.json({ record });
  } catch {
    return NextResponse.json({ error: "Não foi possível atualizar o registro." }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext<"/api/admin/content/[entity]/[id]">) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  const { entity: rawEntity, id } = await context.params;
  if (!validEntities.has(rawEntity as ContentEntity)) return NextResponse.json({ error: "Cadastro inválido." }, { status: 404 });
  const entity = rawEntity as ContentEntity;
  try {
    if (entity === "categorias") await prisma.packageCategory.update({ where: { id }, data: { active: false, deletedAt: new Date() } });
    else if (entity === "destinos") await prisma.destination.update({ where: { id }, data: { active: false, deletedAt: new Date() } });
    else if (entity === "depoimentos") await prisma.testimonial.delete({ where: { id } });
    else if (entity === "perguntas") await prisma.faq.delete({ where: { id } });
    else await prisma.galleryItem.delete({ where: { id } });
    await writeAudit({ adminUserId: session.userId, action: "CONTENT_DELETED", entityType: entity, entityId: id, summary: `Registro removido de ${entity}.` });
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Este registro está em uso e não pode ser removido." }, { status: 409 });
  }
}
