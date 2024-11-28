import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "@/api/appRouter.ts";
import { createContext } from "@/loaders/trpc.ts";

export const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});
