import { adminMiddleware, authMiddleware } from "#loaders/trpc.loader";
import { procedure } from "#loaders/trpc/core";

/**
 * Public procedure - 인증 불필요 기본 로깅과 에러 처리만 적용
 */
export const publicProcedure = procedure;

/**
 * Authenticated user procedure - 일반 사용자 인증 필요 에러 처리, 로깅, 사용자 인증 순으로 미들웨어 적용
 */
export const authedProcedure = procedure.use(authMiddleware);

/**
 * Admin procedure - 관리자 인증 필요\
 * 에러 처리, 로깅, 관리자 인증 순으로 미들웨어 적용
 */
export const adminProcedure = procedure.use(adminMiddleware);
