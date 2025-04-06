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

  delete: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      logger.info(
        { requestId: ctx.req.id },
        `admin.user.delete 요청 시작: ${input.userId}`,
      );

      try {
        const deletedUser = await adminService.deleteUser(input.userId);
        if (!deletedUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "해당 유저를 찾을 수 없습니다.",
          });
        }

        logger.info(
          { requestId: ctx.req.id },
          `admin.user.delete 요청 성공: ${input.userId}`,
        );
        return { success: true };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          `admin.user.delete 요청 실패: ${input.userId}`,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "유저 삭제 중 오류가 발생했습니다.",
        });
      }
    }),
  get: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      logger.info(
        { requestId: ctx.req.id },
        `admin.user.get 요청 시작: ${input.userId}`,
      );

      try {
        const user = await adminService.getUserById(input.userId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "해당 유저를 찾을 수 없습니다.",
          });
        }

        logger.info(
          { requestId: ctx.req.id },
          `admin.user.get 요청 성공: ${input.userId}`,
        );
        return user;
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          `admin.user.get 요청 실패: ${input.userId}`,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "유저 조회 중 오류가 발생했습니다.",
        });
      }
    }),

  list: adminProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        offset: z.number().optional().default(0),
      }),
    )
    .query(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "admin.user.list 요청 시작");

      try {
        const users = await adminService.getUsers({
          limit: input.limit,
          offset: input.offset,
        });

        logger.info({ requestId: ctx.req.id }, "admin.user.list 요청 성공");
        return users;
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "admin.user.list 요청 실패",
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "유저 목록 조회 중 오류가 발생했습니다.",
        });
      }
    }),
});
