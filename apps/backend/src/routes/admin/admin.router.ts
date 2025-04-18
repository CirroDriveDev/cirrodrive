import { adminProcedure, router } from "@/loaders/trpc.loader.ts";
import { adminUserRouter } from "@/routes/admin/admin.user.router.ts";

export const adminRouter = router({
  user: adminUserRouter,
  // file: adminFileRouter,
  // stat: adminStatRouter,
  verify: adminProcedure.query(() => {
    return { authorized: true };
  }),
});
