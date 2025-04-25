import { PrismaClient, type Prisma } from "@cirrodrive/database";

export type PrismaTx = PrismaClient | Prisma.TransactionClient;

export const prisma = new PrismaClient();
void prisma.$connect();
