import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { serverEnv } from "./env";
import { databaseAdapterUrl } from "./database-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaMariaDb(databaseAdapterUrl(serverEnv.DATABASE_URL));
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (serverEnv.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
