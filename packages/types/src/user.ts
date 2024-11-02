import { z } from "zod";

export const userSchema = z.object({
  id: z.number(),
  username: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-zA-Z0-9-_.]+$/),
  password: z.string().min(8).max(64),
  email: z.string().email(),
  pricingPlan: z.enum(["free", "basic", "premium"]),
  usedStorage: z.number(),
  profileImageUrl: z.string().url().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const usernameSchema = userSchema.shape.username;

export const inputUserDataSchema = userSchema.pick({
  username: true,
  password: true,
  email: true,
});

export const outputUserDataSchema = userSchema.omit({
  password: true,
});

export type UserDTO = z.infer<typeof userSchema>;
export type Username = z.infer<typeof usernameSchema>;
export type InputUserData = z.infer<typeof inputUserDataSchema>;
export type OutputUserData = z.infer<typeof outputUserDataSchema>;
