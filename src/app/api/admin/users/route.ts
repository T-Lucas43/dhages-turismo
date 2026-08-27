import { hash } from "argon2";
import { NextResponse, type NextRequest } from "next/server";
import { writeAudit } from "@/lib/admin/audit";
import { authenticateAdminRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { adminUserCreateSchema } from "@/lib/validation/settings";

export async function POST(request: NextRequest) {
  const session = await authenticateAdminRequest(request, true);
  if (!session || session.user.role !== "OWNER") return NextResponse.json({ error: "Somente o proprietário pode criar administradores." }, { status: 403 });
  const parsed = adminUserCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revise nome, e-mail e senha. A senha deve ter ao menos 10 caracteres." }, { status: 400 });
  const existing = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "Já existe um usuário com este e-mail." }, { status: 409 });
  const user = await prisma.adminUser.create({ data: { name: parsed.data.name, email: parsed.data.email, passwordHash: await hash(parsed.data.password, { type: 2, memoryCost: 19456, timeCost: 3, parallelism: 1 }), role: parsed.data.role, active: parsed.data.active } });
  await writeAudit({ adminUserId: session.userId, action: "ADMIN_USER_CREATED", entityType: "AdminUser", entityId: user.id, summary: `${user.name} foi adicionado ao painel.` });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active } }, { status: 201 });
}
