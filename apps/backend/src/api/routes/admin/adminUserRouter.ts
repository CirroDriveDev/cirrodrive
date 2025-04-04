import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, procedure } from "@/loaders/trpc.ts";

const adminInputSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
  pricingPlan: z.enum(["basic", "premium", "enterprise"]),
  profileImageUrl: z.string().nullable(),
  usedStorage: z.number().default(0),
  customFields: z.record(z.string()).optional(),
});

export const adminUserRouter = router({
  create: procedure.input(adminInputSchema).mutation(() => {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Admin creation service not implemented yet.",
    });
  }),

  update: procedure.input(adminInputSchema).mutation(() => {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Admin update service not implemented yet.",
    });
  }),

  delete: procedure.input(z.number()).mutation(() => {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Admin delete service not implemented yet.",
    });
  }),

  list: procedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        offset: z.number().optional().default(0),
      }),
    )
    .query(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Admin list service not implemented yet.",
      });
    }),

  get: procedure.input(z.number()).query(() => {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Admin get service not implemented yet.",
    });
  }),
});
