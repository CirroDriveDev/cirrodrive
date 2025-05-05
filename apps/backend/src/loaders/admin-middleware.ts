import { TRPCError } from "@trpc/server";
import { middleware } from "@/loaders/trpc.loader.ts";
import { prisma } from "@/loaders/prisma.loader.ts"; // 직접 prisma 접근

/**
 * 관리자 세션을 검사하는 미들웨어입니다.
 *
 * - 로그인 여부 확인
 * - AdminUser 테이블에서 이메일이 존재하는지 검사
 */
export const requireAdminSession = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user || !ctx.sessionToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "로그인이 필요합니다.",
    });
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: ctx.user.email },
  });

  if (!admin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "관리자 권한이 필요합니다.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      adminUser: admin, // adminUser를 다음 context로 전달할 수도 있음
    },
  });
});
