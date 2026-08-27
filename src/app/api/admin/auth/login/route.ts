import { hash, verify } from "argon2";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminSession, csrfCookieOptions, CSRF_COOKIE, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/auth";

const genericError = "E-mail ou senha inválidos.";

export async function POST(request: NextRequest) {
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Revise o e-mail e a senha informados." }, { status: 400 });

    const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
    if (!user) {
      await hash(parsed.data.password, { type: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 });
      return NextResponse.json({ error: genericError }, { status: 401 });
    }

    const now = new Date();
    if (!user.active || user.deletedAt) return NextResponse.json({ error: genericError }, { status: 401 });
    if (user.lockedUntil && user.lockedUntil > now) return NextResponse.json({ error: "Acesso temporariamente bloqueado. Aguarde alguns minutos." }, { status: 429 });

    const validPassword = await verify(user.passwordHash, parsed.data.password);
    if (!validPassword) {
      const failedLoginCount = user.failedLoginCount + 1;
      await prisma.adminUser.update({ where: { id: user.id }, data: { failedLoginCount, lockedUntil: failedLoginCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null } });
      return NextResponse.json({ error: genericError }, { status: 401 });
    }

    await prisma.adminUser.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: now } });
    const session = await createAdminSession(user.id, request);
    await prisma.auditLog.create({ data: { adminUserId: user.id, action: "LOGIN", entityType: "AdminSession", summary: "Login administrativo realizado." } });

    const response = NextResponse.json({ ok: true, user: { name: user.name, role: user.role } });
    response.cookies.set(SESSION_COOKIE, session.token, { ...sessionCookieOptions, expires: session.expiresAt });
    response.cookies.set(CSRF_COOKIE, session.csrfToken, { ...csrfCookieOptions, expires: session.expiresAt });
    return response;
  } catch {
    return NextResponse.json({ error: "O login está temporariamente indisponível." }, { status: 503 });
  }
}
