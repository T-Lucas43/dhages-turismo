import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ packageId: z.string().cuid().optional(), message: z.string().trim().max(500).optional() });

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  await prisma.lead.create({ data: { packageId: parsed.data.packageId, origin: "WHATSAPP", status: "NEW", message: parsed.data.message ?? "Clique no WhatsApp pelo site." } });
  if (parsed.data.packageId) await prisma.package.updateMany({ where: { id: parsed.data.packageId }, data: { whatsappClickCount: { increment: 1 } } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
