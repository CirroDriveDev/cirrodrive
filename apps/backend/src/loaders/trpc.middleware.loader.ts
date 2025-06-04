import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "#loaders/trpc.loader";
import { appRouter } from "#routes/app.router";

export const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});
