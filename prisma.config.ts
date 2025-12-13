// prisma.config.ts
import { PrismaClient } from "@prisma/client";

// Create a single instance of PrismaClient
// Prisma automatically reads DATABASE_URL from .env
export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"], // optional, helpful for debugging
});
