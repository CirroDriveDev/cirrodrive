import { adminUserDTOSchema } from "@cirrodrive/schemas/admin";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type Response } from "express";
import { container } from "#loaders/inversify.loader";
import { logger } from "#loaders/logger.loader";
import { AdminAuthService } from "#services/admin.auth.service";
import { router, adminProcedure, procedure } from "#loaders/trpc.loader";

const adminAuthService = container.get<AdminAuthService>(AdminAuthService);

export const protectedSessionRouter = router({
  /**
   * 관리자 인증 상태 확인
   */
  verify: adminProcedure.query(({ ctx }) => {
    return { authorized: true, admin: ctx.admin };
  }),

  /**
   * 관리자 로그인
   */
  login: procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .output(adminUserDTOSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "admin login 요청 시작");
      if (ctx.admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "이미 로그인되어 있습니다.",
        });
      }
      try {
        const { admin, session, token } = await adminAuthService.login({
          email: input.email,
          password: input.password,
        });
        logger.info({ requestId: ctx.req.id, session }, "admin login 성공");
        adminAuthService.setSessionTokenCookie({
          response: ctx.res as Response,
          token,
          expiresAt: session.expiresAt,
        });
        // DTO 변환: id를 string으로 변환, password 등 민감 정보 제거
        return {
          id: String(admin.id),
          email: admin.email,
          createdAt: admin.createdAt,
          username: admin.username,
        };
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "admin login 실패");
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "아이디 또는 비밀번호가 잘못되었습니다.",
        });
      }
    }),

  /**
   * 관리자 로그아웃
   */
  logout: adminProcedure.mutation(async ({ ctx }) => {
    logger.info({ requestId: ctx.req.id }, "admin logout 요청 시작");
    if (!ctx.adminSessionToken) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "로그인되지 않았습니다.",
      });
    }
    await adminAuthService.logout({ token: ctx.adminSessionToken });
    adminAuthService.clearSessionTokenCookie({ response: ctx.res as Response });
    logger.info({ requestId: ctx.req.id }, "admin logout 성공");
    return { message: "로그아웃 되었습니다." };
  }),
});
