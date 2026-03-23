import { PrismaClient } from "@prisma/client";

declare global {
  // Reuse the Prisma client during local dev reloads.
  var __expenseManagerPrisma__: PrismaClient | undefined;
}

export const db = globalThis.__expenseManagerPrisma__ ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__expenseManagerPrisma__ = db;
}
