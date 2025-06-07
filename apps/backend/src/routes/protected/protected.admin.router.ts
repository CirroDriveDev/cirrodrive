import { TRPCError } from "@trpc/server";
import {
  AdminUserCreateInputDTOSchema,
  AdminUserGetOutputDTOSchema,
} from "@cirrodrive/schemas/admin";
import { z } from "zod";
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

  /**
   * 관리자 계정 목록을 조회합니다.
   *
   * @throws
   *
   *   - UNAUTHORIZED: 관리 권한이 없는 경우
   *   - BAD_REQUEST: limit 또는 offset이 올바르지 않은 경우 (음수 등)
   *   - INTERNAL_SERVER_ERROR: 서버 내부 오류
   *
   * @input
   *  - limit: 조회할 관리자 계정 수 (옵션, 기본값 10)
   *  - offset: 조회 시작 위치 (옵션, 기본값 0)
   *
   * @validation
   *  - limit과 offset은 0 이상의 정수여야 합니다.
   *
   * @output
   *  - 관리자 DTO 배열 반환 (AdminUserGetOutputDTOSchema[])
   */
  listAdmins: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(0).optional().default(10),
        offset: z.number().int().min(0).optional().default(0),
      }),
    )
    .output(z.array(AdminUserGetOutputDTOSchema))
    .query(() => {
      throw new Error("Not implemented yet");
    }),
});
