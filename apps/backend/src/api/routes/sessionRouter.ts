import { outputUserDataSchema, userSchema } from "@cirrodrive/types";
import { TRPCError } from "@trpc/server";
import { container } from "@/loaders/inversify.ts";
import { logger } from "@/loaders/logger.ts";
import { AuthService } from "@/services/authService.ts";
import { router, procedure, authedProcedure } from "@/loaders/trpc.ts";

const authService = container.get<AuthService>(AuthService);

export const sessionRouter = router({
  login: procedure
    .input(
      userSchema.pick({
        username: true,
        password: true,
      }),
    )
    .output(outputUserDataSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "login 요청 시작");

      if (ctx.user) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const { user, session, token } = await authService.login(
        input.username,
        input.password,
      );
      authService.setSessionTokenCookie(ctx.res, token, session.expiresAt);
      return user;
    }),

  logout: authedProcedure.mutation(async ({ ctx }) => {
    logger.info({ requestId: ctx.req.id }, "logout 요청 시작");

    await authService.logout(ctx.sessionToken);
    authService.clearSessionTokenCookie(ctx.res);
  }),
});
