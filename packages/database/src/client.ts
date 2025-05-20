import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getEnv } from "@cirrodrive/utils/env";
import { z } from "zod";
import { PrismaClient } from "#prisma";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envDir = join(__dirname, "..");
process.stdout.write(`envDir: ${envDir}\n`);
const env = getEnv(
  z.object({
    DATABASE_URL: z.string().url(),
  }),
  {
    envDir,
  },
);
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

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
