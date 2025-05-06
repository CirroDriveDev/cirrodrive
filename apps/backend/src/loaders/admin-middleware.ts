import { TRPCError } from "@trpc/server";
import { middleware } from "@/loaders/trpc.loader.ts";

/**
 * 관리자 세션을 검사하는 미들웨어입니다.
 *
 * - 로그인 여부 확인
 * - `ctx.user.isAdmin`이 true인지 검사하여 관리자 권한 확인
 */
export const requireAdminSession = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user || !ctx.sessionToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "로그인이 필요합니다.",
    });
  }

  if (!ctx.user.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "관리자 권한이 필요합니다.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      adminUser: ctx.user,
    },
  });
});
