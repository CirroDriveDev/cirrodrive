import { TRPCError } from "@trpc/server";
import { middleware } from "#loaders/trpc/core";

/**
 * 관리자를 위한 미들웨어 Inner context에서 관리자 정보를 검증하고 관리자 전용 context를 반환
 */
export const adminMiddleware = middleware(async (opts) => {
  const { ctx } = opts;

  // 관리자 인증 정보 검증
  if (!ctx.admin || !ctx.adminSession || !ctx.adminSessionToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "관리자 인증이 필요합니다.",
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      logger: ctx.logger.child({ adminId: ctx.admin.id }),
      admin: ctx.admin,
      adminSession: ctx.adminSession,
      adminSessionToken: ctx.adminSessionToken,
      // 관리자 context에서는 일반 사용자 정보를 제거
      user: undefined,
      session: undefined,
      sessionToken: undefined,
    },
  });
});
