import { prisma } from "@/lib/prisma";

function serializable(value: unknown) {
  return value == null
    ? undefined
    : JSON.parse(JSON.stringify(value, (_key, item) => typeof item === "bigint" ? item.toString() : item));
}

export async function writeAudit(input: {
  adminUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  beforeState?: unknown;
  afterState?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      adminUserId: input.adminUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      beforeState: serializable(input.beforeState),
      afterState: serializable(input.afterState),
    },
  });
}
