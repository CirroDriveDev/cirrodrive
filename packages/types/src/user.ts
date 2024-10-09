import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
  email: z.string(),
  pricingPlan: z.string(),
  usedStorage: z.number(),
  profileImageUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserInputSchema = UserSchema.pick({
  username: true,
  password: true,
  email: true,
});

export const UserOutputSchema = UserSchema.omit({
  password: true,
});

export type User = z.infer<typeof UserSchema>;
export type UserInput = z.infer<typeof UserInputSchema>;
export type UserOutput = z.infer<typeof UserOutputSchema>;
