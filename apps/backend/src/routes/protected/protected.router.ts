import { protectedStatRouter } from "@/routes/protected/protected.stat.router.ts";
import { router } from "@/loaders/trpc.loader.ts";
import { protectedUserRouter } from "@/routes/protected/protected.user.router.ts";
import { protectedFileRouter } from "@/routes/protected/protected.file.router.ts";
import { protectedAdminRouter } from "@/routes/protected/protected.admin.router.ts";
import { protectedSessionRouter } from "@/routes/protected/protected.session.router.ts";

export const protectedRouter = router({
  admin: protectedAdminRouter,
  user: protectedUserRouter,
  file: protectedFileRouter,
  stat: protectedStatRouter,
  session: protectedSessionRouter,
});
