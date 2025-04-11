import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, adminProcedure } from "@/loaders/trpc.ts";
import { container } from "@/loaders/inversify.ts";
import { AdminService } from "@/services/adminService.ts";
import { logger } from "@/loaders/logger.ts";

const adminService = container.get<AdminService>(AdminService);

const userInputSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
  email: z.string().email(),
  pricingPlan: z.enum(["free", "basic", "premium"]),
  profileImageUrl: z.string().nullable(),
  usedStorage: z.number().default(0),
  customFields: z.record(z.string()).optional(),
  isAdmin: z.boolean().default(false),
});

export const adminUserRouter = router({
  create: adminProcedure
    .input(userInputSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "admin.user.create 요청 시작");

      try {
        const user = await adminService.create({
          username: input.username,
          password: input.password,
          email: input.email,
          pricingPlan: input.pricingPlan,
          profileImageUrl: input.profileImageUrl,
          usedStorage: input.usedStorage,
          isAdmin: false,
        });

        logger.info({ requestId: ctx.req.id }, "admin.user.create 요청 성공");
        return user;
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "admin.user.create 요청 실패",
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "사용자 생성 중 오류가 발생했습니다.",
        });
      }
    }),

  update: adminProcedure.input(userInputSchema).mutation(() => {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "User update service not implemented yet.",
    });
  }),

  delete: adminProcedure.input(z.number()).mutation(() => {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "User delete service not implemented yet.",
    });
  }),

  list: adminProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        offset: z.number().optional().default(0),
      }),
    )
    .query(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User list service not implemented yet.",
      });
    }),

  get: adminProcedure.input(z.number()).query(() => {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "User get service not implemented yet.",
    });
  }),
});
