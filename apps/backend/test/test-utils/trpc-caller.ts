import { createCallerFactory } from "#loaders/trpc.loader";
import { appRouter } from "#routes/app.router";

export const createCaller = createCallerFactory(appRouter);
