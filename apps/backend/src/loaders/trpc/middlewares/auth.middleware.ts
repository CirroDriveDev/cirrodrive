import { TRPCError } from "@trpc/server";
import { middleware } from "#loaders/trpc/core";

/**
 * 인증된 사용자를 위한 미들웨어 Inner context에서 사용자 정보를 검증하고 인증된 context를 반환
 */
export const authMiddleware = middleware(async (opts) => {
  const { ctx } = opts;

  // 사용자 인증 정보 검증
  if (!ctx.user || !ctx.session || !ctx.sessionToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "사용자 인증이 필요합니다.",
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      logger: ctx.logger.child({ userId: ctx.user.id }),
      user: ctx.user,
      session: ctx.session,
      sessionToken: ctx.sessionToken,
      admin: undefined,
      adminSession: undefined,
      adminSessionToken: undefined,
    },
  });
});
