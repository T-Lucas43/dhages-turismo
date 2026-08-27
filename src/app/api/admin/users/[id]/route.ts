import { hash } from "argon2";
import { NextResponse, type NextRequest } from "next/server";
import { writeAudit } from "@/lib/admin/audit";
import { authenticateAdminRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { adminUserUpdateSchema } from "@/lib/validation/settings";

export async function PATCH(request: NextRequest, context: RouteContext<"/api/admin/users/[id]">) {
  const session = await authenticateAdminRequest(request, true);
  if (!session || session.user.role !== "OWNER") return NextResponse.json({ error: "Somente o proprietário pode editar administradores." }, { status: 403 });
  const { id } = await context.params;
  const parsed = adminUserUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revise os dados do administrador." }, { status: 400 });
  if (id === session.userId && !parsed.data.active) return NextResponse.json({ error: "Você não pode desativar o próprio acesso." }, { status: 400 });
  const before = await prisma.adminUser.findFirst({ where: { id, deletedAt: null } });
  if (!before) return NextResponse.json({ error: "Administrador não encontrado." }, { status: 404 });
  const user = await prisma.adminUser.update({ where: { id }, data: { name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, active: parsed.data.active, ...(parsed.data.password ? { passwordHash: await hash(parsed.data.password, { type: 2, memoryCost: 19456, timeCost: 3, parallelism: 1 }), sessions: { updateMany: { where: { revokedAt: null }, data: { revokedAt: new Date() } } } } : {}) } });
  await writeAudit({ adminUserId: session.userId, action: "ADMIN_USER_UPDATED", entityType: "AdminUser", entityId: id, summary: `${user.name} foi atualizado.`, beforeState: { name: before.name, email: before.email, role: before.role, active: before.active }, afterState: { name: user.name, email: user.email, role: user.role, active: user.active } });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active } });
}
