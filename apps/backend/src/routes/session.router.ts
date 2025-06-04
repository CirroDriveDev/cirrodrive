import { userDTOSchema } from "@cirrodrive/schemas/user";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { container } from "#loaders/inversify.loader";
import { logger } from "#loaders/logger.loader";
import { AuthService } from "#services/auth.service";
import { router, procedure, authedProcedure } from "#loaders/trpc.loader";

const authService = container.get<AuthService>(AuthService);

// 세션 스키마 정의
const sessionSchema = z.object({
  id: z.string(),
  deviceName: z.string(),
  ipAddress: z.string(),
  lastActivity: z.string(),
  isCurrent: z.boolean(),
});

export const sessionRouter = router({
  login: procedure
    .input(
      z.object(
        {
          username: z.string(),
          password: z.string(),
        },
        {
          message: "아이디와 비밀번호를 입력해주세요.",
        },
      ),
    )
    .output(userDTOSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "login 요청 시작");

      try {
        const { user, session, token } = await authService.login({
          username: input.username,
          password: input.password,
        });

        logger.info({ requestId: ctx.req.id, session }, "login 요청 성공");
        authService.setSessionTokenCookie({
          response: ctx.res,
          token,
          expiresAt: session.expiresAt,
        });

        return user;
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "login 요청 실패");

        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "아이디 또는 비밀번호가 잘못되었습니다.",
        });
      }
    }),

  logout: authedProcedure.mutation(async ({ ctx }) => {
    logger.info({ requestId: ctx.req.id }, "logout 요청 시작");

    await authService.logout({ token: ctx.sessionToken });
    authService.clearSessionTokenCookie({ response: ctx.res });
  }),

  validate: authedProcedure.output(userDTOSchema).query(({ ctx }) => {
    logger.info({ requestId: ctx.req.id }, "validate 요청 시작");

    return ctx.user;
  }),

  // 사용자의 활성 세션 목록 조회
  getSessions: authedProcedure
    .output(sessionSchema.array())
    .query(async ({ ctx }) => {
      logger.info({ requestId: ctx.req.id }, "getSessions 요청 시작");

      try {
        const sessions = await authService.getUserSessions({
          userId: ctx.user.id,
          currentSessionToken: ctx.sessionToken,
        });

        logger.info({ requestId: ctx.req.id }, "getSessions 요청 성공");
        return sessions;
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "getSessions 요청 실패");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "세션 목록을 가져오는 중 오류가 발생했습니다.",
        });
      }
    }),

  // 특정 세션 로그아웃 (원격 로그아웃)
  logoutSession: authedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "logoutSession 요청 시작");

      try {
        // 현재 세션은 로그아웃할 수 없음
        if (input.sessionId === ctx.session?.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "현재 세션은 로그아웃할 수 없습니다.",
          });
        }

        await authService.logoutSpecificSession({
          sessionId: input.sessionId,
          userId: ctx.user.id,
        });

        logger.info({ requestId: ctx.req.id }, "logoutSession 요청 성공");
        return { success: true };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "logoutSession 요청 실패",
        );

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "세션 로그아웃 중 오류가 발생했습니다.",
        });
      }
    }),
});
