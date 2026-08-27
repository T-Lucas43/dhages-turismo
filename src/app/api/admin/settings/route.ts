import { NextResponse, type NextRequest } from "next/server";
import { writeAudit } from "@/lib/admin/audit";
import { authenticateAdminRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { companySettingsSchema } from "@/lib/validation/settings";

export async function GET(request: NextRequest) {
  const session = await authenticateAdminRequest(request);
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  const settings = await prisma.companySettings.findUnique({ where: { singletonKey: "default" } });
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  const parsed = companySettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revise os dados da empresa.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const before = await prisma.companySettings.findUnique({ where: { singletonKey: "default" } });
  const settings = await prisma.companySettings.upsert({ where: { singletonKey: "default" }, update: parsed.data, create: { singletonKey: "default", ...parsed.data } });
  await writeAudit({ adminUserId: session.userId, action: "SETTINGS_UPDATED", entityType: "CompanySettings", entityId: settings.id, summary: "Configurações da empresa atualizadas.", beforeState: before, afterState: settings });
  return NextResponse.json({ settings });
}
