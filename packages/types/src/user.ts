import { z } from "zod";

// user
export const userSchema = z.object({
  id: z.coerce.number(),
  username: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-zA-Z0-9-_.]+$/),
  password: z.string().min(8).max(64),
  email: z.string().email(),
  pricingPlan: z.enum(["free", "basic", "premium"]),
  usedStorage: z.coerce.number(),
  profileImageUrl: z.string().url().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export const usernameParamSchema = userSchema.pick({
  username: true,
});
export const userRequestBodySchema = userSchema.pick({
  username: true,
  password: true,
  email: true,
});
export const userResponseBodySchema = userSchema.omit({
  password: true,
});

export type User = z.infer<typeof userSchema>;
export type UsernameParam = z.infer<typeof usernameParamSchema>;
export type UserRequestBody = z.infer<typeof userRequestBodySchema>;
export type UserResponseBody = z.infer<typeof userResponseBodySchema>;

// createUser
export const createUserRequestBodySchema = userRequestBodySchema;
export const createUserResponseBodySchema = userResponseBodySchema;

export type CreateUserRequestBody = z.infer<typeof createUserRequestBodySchema>;
export type CreateUserResponseBody = z.infer<
  typeof createUserResponseBodySchema
>;

// getUsers
export const getUsersQuerySchema = z.object({
  limit: z.coerce.number().optional().default(10),
  offset: z.coerce.number().optional().default(0),
});
export const getUsersResponseBodySchema = z.array(userResponseBodySchema);

export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type GetUsersResponseBody = z.infer<typeof getUsersResponseBodySchema>;

// getUser
export const getUserParamSchema = usernameParamSchema;
export const getUserResponseBodySchema = userResponseBodySchema;

export type GetUserParam = z.infer<typeof getUserParamSchema>;
export type GetUserResponseBody = z.infer<typeof getUserResponseBodySchema>;

// updateUser
export const updateUserParamSchema = usernameParamSchema;
export const updateUserRequestBodySchema = userRequestBodySchema
  .partial()
  .required({ password: true });
export const updateUserResponseBodySchema = userResponseBodySchema;

export type UpdateUserParam = z.infer<typeof updateUserParamSchema>;
export type UpdateUserRequestBody = z.infer<typeof updateUserRequestBodySchema>;
export type UpdateUserResponseBody = z.infer<
  typeof updateUserResponseBodySchema
>;

// deleteUser
export const deleteUserParamSchema = usernameParamSchema;

export type DeleteUserParam = z.infer<typeof deleteUserParamSchema>;
