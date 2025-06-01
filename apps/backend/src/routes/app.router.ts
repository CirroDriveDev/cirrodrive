import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { sessionRouter } from "#routes/session.router";
import { userRouter } from "#routes/user.router";
import { codeRouter } from "#routes/code.router";
import { router } from "#loaders/trpc.loader";
import { fileRouter } from "#routes/file.router";
import { folderRouter } from "#routes/folder.router";
import { entryRouter } from "#routes/entry.router";
import { emailRouter } from "#routes/email.router";
import { protectedRouter } from "#routes/protected/protected.router";
import { planRouter } from "#routes/plan.router";
import { billingRouter } from "#routes/billing.router";
import { subscriptionRouter } from "#routes/subscription.router";
import { storageRouter } from "#routes/storage.router";
import { paymentRouter } from "#routes/payment.router";

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
  subscription: subscriptionRouter,
  storage: storageRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
