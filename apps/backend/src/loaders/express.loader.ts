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
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { loggerMiddleware } from "@/loaders/logger.loader.ts";
import { env } from "@/loaders/env.loader.ts";
import { appRouter } from "@/routes/app.router.ts";
import { createContext } from "@/loaders/trpc.loader.ts";

export const TRPC_PATH = "/trpc";

export const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

/**
 * Express application instance.
 */

export const expressLoader = (): Express => {
  const app = express();

  app.use(
    cors({
      credentials: true,
      origin: [
        `http://${env.EC2_PUBLIC_URL}`,
        `http://${env.EC2_PUBLIC_URL}:${env.CLIENT_PORT}`,
      ],
    }),
  );
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
