import { router } from "@/loaders/trpc.ts";
import { adminUserRouter } from "@/api/routes/admin/adminUserRouter.ts";

export const adminRouter = router({
  user: adminUserRouter,
  // file: adminFileRouter,
  // stat: adminStatRouter,
});
