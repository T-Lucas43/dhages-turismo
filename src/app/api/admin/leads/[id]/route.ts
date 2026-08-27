import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { writeAudit } from "@/lib/admin/audit";
import { authenticateAdminRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const schema = z.object({ status: z.enum(["NEW", "IN_PROGRESS", "PROPOSAL_SENT", "WON", "LOST", "WAITING_LIST"]), adminNotes: z.string().trim().max(10_000).nullable().optional() });

export async function PATCH(request: NextRequest, context: RouteContext<"/api/admin/leads/[id]">) {
  const session = await authenticateAdminRequest(request, true);
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Status ou observação inválidos." }, { status: 400 });
  const { id } = await context.params;
  const before = await prisma.lead.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  const lead = await prisma.lead.update({ where: { id }, data: parsed.data });
  await writeAudit({ adminUserId: session.userId, action: "LEAD_UPDATED", entityType: "Lead", entityId: id, summary: `Lead atualizado para ${lead.status}.`, beforeState: before, afterState: lead });
  return NextResponse.json({ lead });
}
