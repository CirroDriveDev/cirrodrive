import { hash } from "@node-rs/argon2";
import { z } from "zod";
import { prisma } from "#client";

const envSchema = z.object({
  AUTH_DEFAULT_ADMIN_EMAIL: z.string().email(),
  AUTH_DEFAULT_ADMIN_PASSWORD: z.string().min(8),
  AUTH_DEFAULT_ADMIN_USERNAME: z.string().min(1),
});

const env = envSchema.parse(process.env);

export async function createAdmin(
  email: string,
  password: string,
  username: string,
) {
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      username,
      email,
      password: await hash(password),
    },
  });

  return { admin };
}

export async function seedAdmin() {
  const email = env.AUTH_DEFAULT_ADMIN_EMAIL;
  const password = env.AUTH_DEFAULT_ADMIN_PASSWORD;
  const username = env.AUTH_DEFAULT_ADMIN_USERNAME;

  if (!email || !password || !username) {
    throw new Error("Admin credentials are not set in environment variables.");
  }

  return createAdmin(email, password, username);
}
