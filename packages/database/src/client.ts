import { z } from "zod";
import { PrismaClient } from "#prisma";

const envSchema = z.object({
  MODE: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().url(),
});

const env = envSchema.parse({
  MODE: process.env.MODE,
  DATABASE_URL: process.env.DATABASE_URL,
});
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

if (env.MODE !== "production") globalForPrisma.prisma = prisma;
