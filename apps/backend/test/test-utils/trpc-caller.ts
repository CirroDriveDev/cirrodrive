import { createCallerFactory } from "#loaders/trpc.loader.js";
import { appRouter } from "#routes/app.router.js";

export const createCaller = createCallerFactory(appRouter);
