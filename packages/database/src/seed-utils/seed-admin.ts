import { hash } from "@node-rs/argon2";
import { getEnv } from "@cirrodrive/utils/env";
import { z } from "zod";
import { prisma } from "#client";

const envSchema = z.object({
  AUTH_DEFAULT_ADMIN_EMAIL: z.string().email(),
  AUTH_DEFAULT_ADMIN_PASSWORD: z.string().min(8),
  AUTH_DEFAULT_ADMIN_USERNAME: z.string().min(1),
});

const env = getEnv(envSchema);

export async function createAdmin(
  email: string,
  password: string,
  name: string,
) {
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      name,
      email,
      password: await hash(password),
    },
  });

  return { admin };
}

export async function seedAdmin() {
  const email = env.AUTH_DEFAULT_ADMIN_EMAIL;
  const password = env.AUTH_DEFAULT_ADMIN_PASSWORD;
  const name = env.AUTH_DEFAULT_ADMIN_USERNAME;

  if (!email || !password || !name) {
    throw new Error("Admin credentials are not set in environment variables.");
  }

  return createAdmin(email, password, name);
}
