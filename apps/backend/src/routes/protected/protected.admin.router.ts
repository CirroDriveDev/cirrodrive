import { TRPCError } from "@trpc/server";
import { AdminUserCreateInputDTOSchema } from "@cirrodrive/schemas/admin";
import { router, adminProcedure } from "#loaders/trpc.loader";
import { AdminService } from "#services/admin.service";
import { logger } from "#loaders/logger.loader";
import { container } from "#loaders/inversify.loader";

const adminService = container.get<AdminService>(AdminService);

export const protectedAdminRouter = router({
  admincreate: adminProcedure
    .input(AdminUserCreateInputDTOSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info(
        { requestId: ctx.req.id },
        "protected.admin.admincreate 요청 시작",
      );

      try {
        const adminUser = await adminService.createAdmin({
          username: input.username,
          password: input.password,
          email: input.email,
        });

        logger.info(
          { requestId: ctx.req.id },
          "protected.admin.admincreate 요청 성공",
        );
        return adminUser;
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "protected.admin.admincreate 요청 실패",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "관리자 계정 생성 중 오류가 발생했습니다.",
        });
      }
    }),
});
