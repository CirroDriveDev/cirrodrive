import "express-async-errors";
import express, {
  json,
  urlencoded,
  type Request,
  type Response,
  type NextFunction,
  type Express,
} from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import cors from "cors";
import { loggerMiddleware } from "@/loaders/logger.ts";
import { trpcMiddleware } from "@/loaders/trpcMiddleware.ts";

export const TRPC_PATH = "/trpc";

/**
 * Express application instance.
 */

export const expressLoader = (): Express => {
  const app = express();

  app.use(
    cors({
      origin: import.meta.env.VITE_FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(loggerMiddleware);

  if (import.meta.env.PROD) {
    app.use(helmet());
  }

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
