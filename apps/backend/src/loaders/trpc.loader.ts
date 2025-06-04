// Context
export { createContext, type Context } from "#loaders/trpc/context";

// tRPC core
export {
  middleware,
  router,
  procedure,
  createCallerFactory,
} from "#loaders/trpc/core";

// Middlewares
export { adminMiddleware } from "#loaders/trpc/middlewares/admin.middleware";
export { authMiddleware } from "#loaders/trpc/middlewares/auth.middleware";

// Procedures
export {
  publicProcedure,
  authedProcedure,
  adminProcedure,
} from "#loaders/trpc/procedures";

export const TRPC_PATH = "/trpc";
