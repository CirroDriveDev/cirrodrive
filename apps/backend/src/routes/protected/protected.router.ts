import { protectedStatRouter } from "@/routes/protected/protected.stat.router";
import { router } from "@/loaders/trpc.loader.ts";
import { protectedUserRouter } from "@/routes/protected/protected.user.router";
import { protectedFileRouter } from "@/routes/protected/protected.file.router";
import { protectedAdminRouter } from "@/routes/protected/protected.admin.router";
import { protectedSessionRouter } from "@/routes/protected/protected.session.router";

export const protectedRouter = router({
  admin: protectedAdminRouter,
  user: protectedUserRouter,
  file: protectedFileRouter,
  stat: protectedStatRouter,
  session: protectedSessionRouter,
});
