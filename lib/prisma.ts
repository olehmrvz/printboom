import { PrismaClient } from "@/app/generated/prisma/client";

let prisma: PrismaClient | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

  const dbPath = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url: dbPath });

  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    (global as unknown as { prisma: PrismaClient }).prisma = prisma;
  }
} catch (e: any) {
  // Native module (better-sqlite3) not available in serverless environment
  console.warn("[DB] not available:", e.message);
}

export { prisma };
