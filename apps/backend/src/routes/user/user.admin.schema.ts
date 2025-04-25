import { z } from "zod";

export const userInputSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
  email: z.string().email(),
  pricingPlan: z.enum(["FREE", "BASIC", "PREMIUM"]),
  profileImageUrl: z.string().nullable(),
  usedStorage: z.number().default(0),
  customFields: z.record(z.string()).optional(),
  isAdmin: z.boolean().default(false),
});
