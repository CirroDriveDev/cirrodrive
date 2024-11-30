import { userDTOSchema } from "@cirrodrive/schemas";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { container } from "@/loaders/inversify.ts";
import { logger } from "@/loaders/logger.ts";
import { AuthService } from "@/services/authService.ts";
import { router, procedure, authedProcedure } from "@/loaders/trpc.ts";

const authService = container.get<AuthService>(AuthService);

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

  validate: authedProcedure.output(z.literal(true)).query(({ ctx }) => {
    logger.info({ requestId: ctx.req.id }, "validate 요청 시작");

    return true;
  }),
});
