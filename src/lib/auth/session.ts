import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { prisma } from "../prisma";
import { serverEnv } from "../env";
import { createRandomToken, hashSensitiveValue, hashToken, safeTokenEqual } from "../security/tokens";

export const SESSION_COOKIE = "dhages_admin_session";
export const CSRF_COOKIE = "dhages_admin_csrf";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

export async function createAdminSession(userId: string, request: Request) {
  const token = createRandomToken();
  const csrfToken = createRandomToken(24);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await prisma.adminSession.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      csrfTokenHash: hashToken(csrfToken),
      ipHash: hashSensitiveValue(requestIp(request)),
      userAgent: request.headers.get("user-agent")?.slice(0, 500),
      expiresAt,
    },
  });
  return { token, csrfToken, expiresAt };
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: serverEnv.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
  priority: "high" as const,
};

export const csrfCookieOptions = {
  httpOnly: false,
  secure: serverEnv.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/admin",
  maxAge: SESSION_MAX_AGE_SECONDS,
  priority: "high" as const,
};

async function findValidSession(rawToken?: string) {
  if (!rawToken) return null;
  return prisma.adminSession.findFirst({
    where: { tokenHash: hashToken(rawToken), revokedAt: null, expiresAt: { gt: new Date() }, user: { active: true, deletedAt: null } },
    include: { user: true },
  });
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const session = await findValidSession(cookieStore.get(SESSION_COOKIE)?.value);
  return session?.user ?? null;
}

export async function authenticateAdminRequest(request: NextRequest, csrfRequired = false) {
  const rawToken = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await findValidSession(rawToken);
  if (!session) return null;

  if (csrfRequired) {
    const csrfToken = request.headers.get("x-csrf-token");
    if (!csrfToken || !safeTokenEqual(csrfToken, session.csrfTokenHash)) return null;
  }

  return session;
}
