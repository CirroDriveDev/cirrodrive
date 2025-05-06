import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "@/loaders/trpc.loader.ts";
import { userAdminRouter } from "@/routes/user/user.admin.router.ts";
import { container } from "@/loaders/inversify.loader.ts";
import { AdminService } from "@/services/admin.service.ts";
import { logger } from "@/loaders/logger.loader.ts";
import { requireAdminSession } from "@/loaders/admin-middleware.ts";

const adminService = container.get<AdminService>(AdminService);

export const adminRouter = router({
  user: userAdminRouter,
  // file: fileAdminRouter,
  // stat: statAdminRouter,

  /**
   * 관리자 인증을 위한 API입니다.
   */
  verify: adminProcedure.use(requireAdminSession).query(() => {
    return { authorized: true };
  }),

  /**
   * 가입한 회원 수를 반환하는 프로시저입니다. 입력값: period: "1d" | "1w" | "6m"
   */
  getNewUsersCount: adminProcedure
    .use(requireAdminSession)
    .input(
      z.object({
        period: z.enum(["1d", "1w", "6m"]),
      }),
    )
    .query(async ({ input, ctx }) => {
      logger.info(
        { requestId: ctx.req.id, period: input.period },
        "admin.getNewUsersCount 요청 시작",
      );
      return await adminService.getNewUsersCount(input.period);
    }),

  /**
   * 파일 업로드 수를 위한 API입니다.
   */
  getUploadCount: adminProcedure
    .use(requireAdminSession)
    .input(
      z.object({
        period: z.enum(["1d", "1w", "6m"]),
      }),
    )
    .query(async ({ input, ctx }) => {
      logger.info(
        { requestId: ctx.req.id, period: input.period },
        "admin.getUploadCount 요청 시작",
      );
      return await adminService.getUploadCount(input.period);
    }),

  /**
   * 전체 파일 수를 위한 API입니다. (휴지통에 있는 파일 포함)
   */
  getTotalFiles: adminProcedure
    .use(requireAdminSession)
    .query(async ({ ctx }) => {
      logger.info(
        { requestId: ctx.req.id },
        "admin.getTotalFiles 요청 시작 (휴지통 포함)",
      );
      const totalFiles = await adminService.getTotalFiles();
      logger.info({ requestId: ctx.req.id }, "admin.getTotalFiles 요청 성공");
      return { totalFiles };
    }),

  /**
   * 탈퇴한 유저 수 조회를 위한 API입니다.
   */
  getTotalUsers: adminProcedure
    .use(requireAdminSession)
    .query(async ({ ctx }) => {
      logger.info({ requestId: ctx.req.id }, "admin.getTotalUsers 요청 시작");
      const totalUsers = await adminService.getTotalUsers();
      logger.info({ requestId: ctx.req.id }, "admin.getTotalUsers 요청 성공");
      return { totalUsers };
    }),

  /**
   * 탈퇴한 유저 수를 조회하는 API입니다. 입력값: period - "1d"(하루) 또는 "1w"(일주일) 중 하나
   */
  listDeletedUsers: adminProcedure
    .use(requireAdminSession)
    .input(z.object({ period: z.enum(["1d", "1w"]) }))
    .query(async ({ input, ctx }) => {
      logger.info(
        { requestId: ctx.req.id, period: input.period },
        "admin.listDeletedUsers 요청 시작",
      );
      const deletedUsersCount = await adminService.getDeletedUsersCount(
        input.period,
      );
      logger.info(
        { requestId: ctx.req.id, period: input.period },
        "admin.listDeletedUsers 요청 성공",
      );
      return { deletedUsersCount };
    }),

  /**
   * 최근 업로드 파일 목록을 조회하는 API입니다. 현재 로그인한 사용자의 최근 업로드 파일(최대 5개)을 내림차순으로 조회합니다.
   */
  recentFiles: adminProcedure
    .use(requireAdminSession)
    .query(async ({ ctx }) => {
      const currentUserId = ctx.user?.id; // ctx.user가 null일 수 있으므로 체크
      if (!currentUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "로그인된 사용자가 없습니다.",
        });
      }
      const files = await adminService.getRecentUserFiles(currentUserId, 5);
      return files;
    }),

  login: adminProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(8) }))
    .mutation(async ({ input }) => {
      const { email, password } = input;
      return adminService.login(email, password);
    }),
});
