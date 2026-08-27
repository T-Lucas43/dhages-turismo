import { UserManager } from "@/components/admin/user-manager";
import { getCurrentAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const [current, users] = await Promise.all([getCurrentAdmin(), prisma.adminUser.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "asc" } })]);
  return <UserManager canManage={current?.role === "OWNER"} users={users.map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, active: user.active, lastLoginAt: user.lastLoginAt?.toISOString() ?? null, createdAt: user.createdAt.toISOString() }))} />;
}
