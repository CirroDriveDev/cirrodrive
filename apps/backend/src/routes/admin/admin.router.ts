import { adminProcedure, router } from "@/loaders/trpc.loader.ts";
import { userAdminRouter } from "@/routes/user/user.admin.router.ts";

export const adminRouter = router({
  user: userAdminRouter,
  // file: fileAdminRouter,
  // stat: statAdminRouter,

  /**
   * 관리자 인증을 위한 API입니다.
   */
  verify: adminProcedure.query(() => {
    return { authorized: true };
  }),
});
