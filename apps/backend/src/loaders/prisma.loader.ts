import { type PrismaClient, type Prisma } from "@cirrodrive/database/prisma";

export type PrismaTx = PrismaClient | Prisma.TransactionClient;

export { prisma } from "@cirrodrive/database/client";
