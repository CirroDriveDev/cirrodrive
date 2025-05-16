import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { sessionRouter } from "@/routes/session.router.ts";
import { userRouter } from "@/routes/user.router.ts";
import { codeRouter } from "@/routes/code.router.ts";
import { router } from "@/loaders/trpc.loader.ts";
import { fileRouter } from "@/routes/file.router.ts";
import { folderRouter } from "@/routes/folder.router.ts";
import { entryRouter } from "@/routes/entry.router.ts";
import { emailRouter } from "@/routes/email.router.ts";
import { protectedRouter } from "@/routes/protected/protected.router.ts";

export const appRouter = router({
  protected: protectedRouter,
  code: codeRouter,
  email: emailRouter,
  entry: entryRouter,
  file: fileRouter,
  folder: folderRouter,
  session: sessionRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
