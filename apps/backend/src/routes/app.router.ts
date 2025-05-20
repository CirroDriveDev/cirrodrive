import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { sessionRouter } from "#routes/session.router.js";
import { userRouter } from "#routes/user.router.js";
import { codeRouter } from "#routes/code.router.js";
import { router } from "#loaders/trpc.loader.js";
import { fileRouter } from "#routes/file.router.js";
import { folderRouter } from "#routes/folder.router.js";
import { entryRouter } from "#routes/entry.router.js";
import { emailRouter } from "#routes/email.router.js";
import { protectedRouter } from "#routes/protected/protected.router.js";
import { planRouter } from "#routes/plan.router.js";
import { billingRouter } from "#routes/billing.router.js";

export const appRouter = router({
  billing: billingRouter,
  protected: protectedRouter,
  code: codeRouter,
  email: emailRouter,
  entry: entryRouter,
  file: fileRouter,
  folder: folderRouter,
  session: sessionRouter,
  user: userRouter,
  plan: planRouter,
});

export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
