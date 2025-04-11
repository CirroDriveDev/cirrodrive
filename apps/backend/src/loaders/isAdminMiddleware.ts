import { TRPCError } from "@trpc/server";
import { middleware } from "@/loaders/trpc.ts";

export const isAdminMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.user?.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "관리자 권한이 필요합니다.",
    });
  }
  return next();
});
