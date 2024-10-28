import { z } from "zod";

import { userResponseBodySchema, userSchema } from "./user.ts";

// session
export const sessionSchema = z.object({
  id: z.string(),
  userId: userSchema.shape.id,
  expiresAt: z.coerce.date(),
});

export type Session = z.infer<typeof sessionSchema>;

// login
export const loginRequestBodySchema = userSchema.pick({
  username: true,
  password: true,
});
export const loginResponseBodySchema = userResponseBodySchema;

export type LoginRequestBody = z.infer<typeof loginRequestBodySchema>;
export type LoginResponseBody = z.infer<typeof loginResponseBodySchema>;

// logout
export const logoutRequestBodySchema = z.object({});
export const logoutResponseBodySchema = z.object({
  success: z.coerce.boolean(),
});

export type LogoutRequest = z.infer<typeof logoutRequestBodySchema>;
export type LogoutResponse = z.infer<typeof logoutResponseBodySchema>;

// refreshToken
export const refreshTokenRequestSchema = z.object({
  token: z.string(),
});
export const refreshTokenResponseSchema = z.object({
  token: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
