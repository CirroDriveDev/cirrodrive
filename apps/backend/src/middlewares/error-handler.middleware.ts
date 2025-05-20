import { TRPCError } from "@trpc/server";
import { AppError } from "#errors/error-classes.js";
import { middleware } from "#loaders/trpc.loader.js";
import { logger } from "#loaders/logger.loader.js";

/**
 * TRPC 공통 에러 처리 미들웨어
 *
 * - AppError → TRPCError 변환
 * - 기타 예외는 INTERNAL_SERVER_ERROR 처리
 * - ZodError는 tRPC 내부에서 자동 처리되므로 생략
 */
export const errorHandlingMiddleware = middleware(async (opts) => {
  const start = Date.now();
  try {
    const result = await opts.next();
    const duration = Date.now() - start;
    logger.debug({ path: opts.path, duration }, "tRPC procedure success");
    return result;
  } catch (err) {
    const duration = Date.now() - start;

    if (err instanceof AppError) {
      logger.warn(
        {
          path: opts.path,
          duration,
          error: err.name,
          message: err.message,
          details: err.details,
        },
        "Handled AppError in tRPC",
      );

      throw new TRPCError({
        code: err.code,
        message: err.message,
        cause: err.details,
      });
    }

    logger.error(
      {
        path: opts.path,
        duration,
        error: err instanceof Error ? err.name : "UnknownError",
        message: err instanceof Error ? err.message : String(err),
      },
      "Unhandled error in tRPC",
    );

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error",
    });
  }
});
