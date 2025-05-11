import { PrismaClient, type Prisma } from "@cirrodrive/database";
import { env } from "@/loaders/env.loader.ts";

export type PrismaTx = PrismaClient | Prisma.TransactionClient;

export const prisma = new PrismaClient({
  datasources: { db: { url: env.DATABASE_URL } },
});
void prisma.$connect();
