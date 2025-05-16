import { z } from "zod";

export const userInputSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
  email: z.string().email(),
  pricingPlan: z.enum(["free", "basic", "premium"]),
  profileImageUrl: z.string().nullable(),
  usedStorage: z.number().default(0),
  customFields: z.record(z.string()).optional(),
  isAdmin: z.boolean().default(false),
});

// 관리자용 DTO 스키마 (출력용)
export const adminUserDTOSchema = z.object({
  id: z.string(),        
  email: z.string().email(),
  name: z.string().optional(), 
  isAdmin: z.boolean().default(true),
  createdAt: z.date(),
});

