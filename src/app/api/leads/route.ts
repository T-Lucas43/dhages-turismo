import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validation/lead";

export async function POST(request: NextRequest) {
  const parsed = leadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revise os dados informados.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.packageId) {
    const exists = await prisma.package.findFirst({ where: { id: parsed.data.packageId, deletedAt: null, publicationStatus: "PUBLISHED" }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "O pacote informado não está disponível." }, { status: 400 });
  }
  const lead = await prisma.lead.create({ data: { name: parsed.data.name, phone: parsed.data.phone, email: parsed.data.email || null, packageId: parsed.data.packageId, message: parsed.data.message, origin: parsed.data.origin, status: parsed.data.origin === "WAITING_LIST" ? "WAITING_LIST" : "NEW", consentAt: new Date() } });
  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}
