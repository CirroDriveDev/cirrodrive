import "express-async-errors";
import express, {
  type Request,
  type Response,
  type NextFunction,
  type Express,
} from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import cors from "cors";
import { loggerMiddleware } from "#loaders/logger.loader";
import { env } from "#loaders/env.loader";
import { trpcMiddleware } from "#loaders/trpc.middleware.loader";
import { TRPC_PATH } from "#loaders/trpc.loader";

/**
 * Express application instance.
 */

export const expressLoader = (): Express => {
  const app = express();

  app.use(
    cors({
      credentials: true,
      origin: [
        `http://${env.APP_PUBLIC_HOST}`,
        `http://${env.APP_PUBLIC_HOST}:${env.APP_FRONTEND_PORT}`,
      ],
    }),
  );
  app.use(cookieParser());
  app.use(loggerMiddleware);

  if (env.PROD) {
    app.use(helmet());
  }

  // 헬스 체크 엔드포인트
  app.get("/health", (req, res) => {
    return res.status(StatusCodes.OK).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      env: env.MODE,
    });
  });

  app.use(TRPC_PATH, trpcMiddleware);

  /**
   * Error handler middleware.
   */
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    req.log.error(err);
    return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
  });
  return app;
};
