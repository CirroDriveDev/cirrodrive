import { PrismaClient } from "@cirrodrive/database";

export const prisma = new PrismaClient();
void prisma.$connect();
