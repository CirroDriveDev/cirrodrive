import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { userDTOSchema } from "@cirrodrive/schemas/user";
import { container } from "#loaders/inversify.loader";
import { logger } from "#loaders/logger.loader";
import { router, authedProcedure } from "#loaders/trpc.loader";
import { AdminService } from "#services/admin.service";

const adminService = container.get<AdminService>(AdminService);

export const adminRouter = router({
  /**
   * 유저 목록 조회 (관리자 전용)
   */
  getUsers: authedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
      }),
    )
    .output(z.array(userDTOSchema))
    .query(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "admin.getUsers 요청 시작");

      try {
        const users = await adminService.getUsers({
          limit: input.limit,
          offset: input.offset,
        });

        logger.info({ requestId: ctx.req.id }, "admin.getUsers 요청 성공");

        return users;
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "admin.getUsers 요청 실패");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "유저 목록 조회 중 오류가 발생했습니다.",
        });
      }
    }),

  /**
   * 특정 유저 조회 (관리자 전용)
   */
  getUserById: authedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .output(userDTOSchema)
    .query(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "admin.getUserById 요청 시작");

      try {
        const user = await adminService.getUserById(input.userId);

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "해당 유저를 찾을 수 없습니다.",
          });
        }

        logger.info({ requestId: ctx.req.id }, "admin.getUserById 요청 성공");

        return user;
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "admin.getUserById 요청 실패",
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "유저 조회 중 오류가 발생했습니다.",
        });
      }
    }),
});
