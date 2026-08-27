import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentAdmin } from "@/lib/auth/session";
import { isFrontendOnly } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Painel administrativo",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (isFrontendOnly) notFound();

  const user = await getCurrentAdmin();
  if (!user) redirect("/acesso-administrativo?returnTo=/admin");

  const [packages, leads] = await Promise.all([
    prisma.package.count({ where: { deletedAt: null, publicationStatus: { not: "ARCHIVED" } } }),
    prisma.lead.count({ where: { status: "NEW" } }),
  ]);

  return (
    <AdminShell user={{ name: user.name, role: user.role }} counts={{ packages, leads }}>
      {children}
    </AdminShell>
  );
}
