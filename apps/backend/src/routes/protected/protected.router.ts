import { protectedStatRouter } from "#routes/protected/protected.stat.router.js";
import { router } from "#loaders/trpc.loader.js";
import { protectedUserRouter } from "#routes/protected/protected.user.router.js";
import { protectedFileRouter } from "#routes/protected/protected.file.router.js";
import { protectedAdminRouter } from "#routes/protected/protected.admin.router.js";
import { protectedSessionRouter } from "#routes/protected/protected.session.router.js";

export const protectedRouter = router({
  admin: protectedAdminRouter,
  user: protectedUserRouter,
  file: protectedFileRouter,
  stat: protectedStatRouter,
  session: protectedSessionRouter,
});
