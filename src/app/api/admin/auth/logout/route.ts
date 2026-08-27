import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdminRequest, CSRF_COOKIE, SESSION_COOKIE } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  await prisma.adminSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
  await prisma.auditLog.create({ data: { adminUserId: session.userId, action: "LOGOUT", entityType: "AdminSession", entityId: session.id } });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(CSRF_COOKIE, "", { path: "/admin", maxAge: 0 });
  return response;
}
