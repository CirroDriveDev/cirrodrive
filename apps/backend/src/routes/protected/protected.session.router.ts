import { adminUserDTOSchema } from "@cirrodrive/schemas/admin.js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type Response } from "express";
import { container } from "#loaders/inversify.loader.js";
import { logger } from "#loaders/logger.loader.js";
import { AuthService } from "#services/auth.service.js";
import {
  router,
  authedProcedure,
  adminProcedure,
} from "#loaders/trpc.loader.js";
import { requireAdminSession } from "#middlewares/admin-middleware.js";

const authService = container.get<AuthService>(AuthService);

export const protectedSessionRouter = router({
  /**
   * 관리자 인증을 위한 API입니다.
   */
  verify: adminProcedure.use(requireAdminSession).query(() => {
    return { authorized: true };
  }),

  login: authedProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .output(adminUserDTOSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "admin login 요청 시작");

      if (ctx.user) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "이미 로그인되어 있습니다.",
        });
      }

      try {
        const { user, session, token } = await authService.login({
          username: input.username,
          password: input.password,
        });

        if (!user.isAdmin) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "관리자 계정이 아닙니다.",
          });
        }

        logger.info({ requestId: ctx.req.id, session }, "admin login 성공");

        const response = ctx.res as Response;
        authService.setSessionTokenCookie({
          response,
          token,
          expiresAt: session.expiresAt,
        });

        return user;
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "admin login 실패");

        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "아이디 또는 비밀번호가 잘못되었습니다.",
        });
      }
    }),

  logout: authedProcedure.mutation(({ ctx }) => {
    logger.info({ requestId: ctx.req.id }, "admin logout 요청 시작");

    if (!ctx.user) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "로그인되지 않았습니다.",
      });
    }

    const response = ctx.res as Response;
    authService.clearSessionTokenCookie({ response });
    logger.info({ requestId: ctx.req.id }, "admin logout 성공");

    return { message: "로그아웃 되었습니다." };
  }),
});
