import { PrismaClient } from "@prisma/client";

const hasDatabase = process.env.ENABLE_DATABASE === "true" && Boolean(process.env.DATABASE_URL?.trim());

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = hasDatabase
  ? global.prisma ?? new PrismaClient()
  : null;

if (hasDatabase && process.env.NODE_ENV !== "production" && prisma) {
  global.prisma = prisma;
}

export { hasDatabase };