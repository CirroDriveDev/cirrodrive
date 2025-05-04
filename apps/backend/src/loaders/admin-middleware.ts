import { TRPCError } from "@trpc/server";
import { middleware } from "@/loaders/trpc.loader.ts";

/**
 * 인증된 관리자 세션 여부를 검사하는 tRPC 미들웨어입니다.
 *
 * - 로그인 상태 확인
 * - 관리자 권한(isAdmin) 확인
 */
export const requireAdminSession = middleware(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.session || !ctx.sessionToken) {
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
      user: ctx.user,
      session: ctx.session,
      sessionToken: ctx.sessionToken,
    },
  });
});
