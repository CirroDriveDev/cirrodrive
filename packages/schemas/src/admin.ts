import { z } from "zod";
import { userSchema } from "#schemas/user";

export const userInputSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
  email: z.string().email(),
  currentPlanId: z.string(),
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

export const AdminUserGetOutputDTOSchema = userSchema
  .pick({
    id: true,
    username: true,
    email: true,
    currentPlanId: true,
    trialUsed: true,
    usedStorage: true,
    createdAt: true,
    updatedAt: true,
  })
  .required();

export type AdminUserGetOutputDTO = z.infer<typeof AdminUserGetOutputDTOSchema>;

export const AdminUserCreateInputDTOSchema = userSchema
  .pick({
    username: true,
    password: true,
    email: true,
    trialUsed: true,
  })
  .required();

export type AdminUserCreateInputDTO = z.infer<
  typeof AdminUserCreateInputDTOSchema
>;

export const AdminUserUpdateInputDTOSchema = userSchema
  .pick({
    id: true,
    username: true,
    password: true,
    email: true,
    trialUsed: true,
  })
  .partial()
  .required({ id: true });

export type AdminUserUpdateInputDTO = z.infer<
  typeof AdminUserUpdateInputDTOSchema
>;
