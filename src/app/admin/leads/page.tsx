import { LeadManager } from "@/components/admin/lead-manager";
import { prisma } from "@/lib/prisma";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, include: { package: { select: { name: true } } } });
  return <LeadManager leads={leads.map((lead) => ({ id: lead.id, name: lead.name, phone: lead.phone, email: lead.email, message: lead.message, origin: lead.origin, status: lead.status, adminNotes: lead.adminNotes, createdAt: lead.createdAt.toISOString(), packageName: lead.package?.name ?? null }))} />;
}
