import { sessionRouter } from "@/api/routes/sessionRouter.ts";
import { userRouter } from "@/api/routes/userRouter.ts";
import { router } from "@/loaders/trpc.ts";

export const appRouter = router({
  user: userRouter,
  session: sessionRouter,
});

export type AppRouter = typeof appRouter;
