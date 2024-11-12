import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { sessionRouter } from "@/api/routes/sessionRouter.ts";
import { userRouter } from "@/api/routes/userRouter.ts";
import { codeRouter } from "@/api/routes/codeRouter.ts";
import { router } from "@/loaders/trpc.ts";

export const appRouter = router({
  user: userRouter,
  session: sessionRouter,
  code: codeRouter,
});

export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
