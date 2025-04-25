import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { sessionRouter } from "@/routes/session/session.router.ts";
import { userRouter } from "@/routes/user/user.router.ts";
import { codeRouter } from "@/routes/code/code.router.ts";
import { router } from "@/loaders/trpc.loader.ts";
import { fileRouter } from "@/routes/file/file.router.ts";
import { entryRouter } from "@/routes/entry/entry.router.ts";
import { emailRouter } from "@/routes/email/email.router.ts";
import { adminRouter } from "@/routes/admin/admin.router.ts";

export const appRouter = router({
  admin: adminRouter,
  code: codeRouter,
  email: emailRouter,
  entry: entryRouter,
  file: fileRouter,
  session: sessionRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
