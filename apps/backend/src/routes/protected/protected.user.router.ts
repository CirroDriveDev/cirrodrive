import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { userInputSchema } from "@cirrodrive/schemas/admin";
import { router, adminProcedure } from "#loaders/trpc.loader";
import { container } from "#loaders/inversify.loader";
import { AdminService } from "#services/admin.service";
import { logger } from "#loaders/logger.loader";

const adminService = container.get<AdminService>(AdminService);

export const protectedUserRouter = router({
  create: adminProcedure
    .input(userInputSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "protected.user.create 요청 시작");

      try {
        const user = await adminService.create({
          username: input.username,
          password: input.password,
          email: input.email,
          planId: input.currentPlanId,
          profileImageUrl: input.profileImageUrl,
          usedStorage: input.usedStorage,
          isAdmin: false,
        });

        logger.info(
          { requestId: ctx.req.id },
          "protected.user.create 요청 성공",
        );
        return user;
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "protected.user.create 요청 실패",
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "사용자 생성 중 오류가 발생했습니다.",
        });
      }
    }),

  update: adminProcedure
    .input(
      userInputSchema.extend({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      logger.info(
        { requestId: ctx.req.id },
        `protected.user.update 요청 시작: ${input.userId}`,
      );

      try {
        const existingUser = await adminService.getUserById(input.userId);
        if (!existingUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "해당 유저를 찾을 수 없습니다.",
          });
        }

        const updatedUser = await adminService.updateUser(input.userId, {
          username: input.username,
          password: input.password,
          email: input.email,
          planId: input.currentPlanId,
          profileImageUrl: input.profileImageUrl,
          usedStorage: input.usedStorage,
        });

        logger.info(
          { requestId: ctx.req.id },
          `protected.user.update 요청 성공: ${input.userId}`,
        );
        return updatedUser;
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          `protected.user.update 요청 실패: ${input.userId}`,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "유저 업데이트 중 오류가 발생했습니다.",
        });
      }
    }),

  delete: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      logger.info(
        { requestId: ctx.req.id },
        `protected.user.delete 요청 시작: ${input.userId}`,
      );

      try {
        const deletedUser = await adminService.deleteUser(input.userId);
        if (!deletedUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "해당 유저를 찾을 수 없습니다.",
          });
        }

        logger.info(
          { requestId: ctx.req.id },
          `protected.user.delete 요청 성공: ${input.userId}`,
        );
        return { success: true };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          `protected.user.delete 요청 실패: ${input.userId}`,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "유저 삭제 중 오류가 발생했습니다.",
        });
      }
    }),
  get: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      logger.info(
        { requestId: ctx.req.id },
        `protected.user.get 요청 시작: ${input.userId}`,
      );

      try {
        const user = await adminService.getUserById(input.userId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "해당 유저를 찾을 수 없습니다.",
          });
        }

        logger.info(
          { requestId: ctx.req.id },
          `protected.user.get 요청 성공: ${input.userId}`,
        );
        return user;
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          `protected.user.get 요청 실패: ${input.userId}`,
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "유저 조회 중 오류가 발생했습니다.",
        });
      }
    }),

  list: adminProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        offset: z.number().optional().default(0),
      }),
    )
    .query(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "protected.user.list 요청 시작");

      try {
        const users = await adminService.getUsers({
          limit: input.limit,
          offset: input.offset,
        });

        logger.info({ requestId: ctx.req.id }, "protected.user.list 요청 성공");
        return users;
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "protected.user.list 요청 실패",
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "유저 목록 조회 중 오류가 발생했습니다.",
        });
      }
    }),
  listFiles: adminProcedure
    .input(
      z.object({
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
        sortBy: z
          .enum(["uploadDate", "owner"])
          .optional()
          .default("uploadDate"),
        order: z.enum(["asc", "desc"]).optional().default("desc"),
      }),
    )
    .query(async ({ input, ctx }) => {
      logger.info(
        { requestId: ctx.req.id },
        "protected.user.listFiles 요청 시작",
      );

      try {
        // currentUserId를 인증 정보에서 가져온다고 가정
        const currentUserId = ctx.user.id;

        const files = await adminService.getAllUserFiles({
          limit: input.limit,
          offset: input.offset,
          sortBy: input.sortBy,
          order: input.order,
          currentUserId, // currentUserId 전달
        });

        logger.info(
          { requestId: ctx.req.id },
          "protected.user.listFiles 요청 성공",
        );
        return files;
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "protected.user.listFiles 요청 실패",
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 목록 조회 중 오류가 발생했습니다.",
        });
      }
    }),
  deleteFile: adminProcedure
    .input(
      z.object({
        fileId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      logger.info(
        { fileId: input.fileId, requestId: ctx.req.id },
        "파일 삭제 요청",
      );

      // currentUserId를 ctx에서 추출 (예: ctx.user.id)
      const currentUserId = ctx.user.id; // 로그인된 사용자의 ID

      try {
        const result = await adminService.deleteFile({
          fileId: input.fileId,
          currentUserId, // currentUserId 전달
        });

        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "파일을 찾을 수 없습니다.",
          });
        }

        return { success: true };
      } catch (error) {
        logger.error({ error, requestId: ctx.req.id }, "파일 삭제 실패");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 삭제 중 오류가 발생했습니다.",
        });
      }
    }),
  listNewUsers: adminProcedure
    .input(z.object({ period: z.enum(["1d", "1w", "6m"]) }))
    .query(async ({ input, ctx }) => {
      logger.info(
        { requestId: ctx.req.id },
        `protected.user.listNewUsers 요청 시작: ${input.period}`,
      );

      try {
        const newUsersCount = await adminService.getNewUsersCount(input.period);

        logger.info(
          { requestId: ctx.req.id },
          `protected.user.listNewUsers 요청 성공: ${input.period}`,
        );
        return { newUsersCount };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "protected.user.listNewUsers 요청 실패",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "가입한 회원 수 조회 중 오류가 발생했습니다.",
        });
      }
    }),
  listUploads: adminProcedure
    .input(z.object({ period: z.enum(["1d", "1w", "6m"]) }))
    .query(async ({ input, ctx }) => {
      logger.info(
        { requestId: ctx.req.id },
        `protected.user.listUploads 요청 시작: ${input.period}`,
      );

      try {
        const uploadCount = await adminService.getUploadCount(input.period);

        logger.info(
          { requestId: ctx.req.id },
          `protected.user.listUploads 요청 성공: ${input.period}`,
        );
        return { uploadCount };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "protected.user.listUploads 요청 실패",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "업로드 수 조회 중 오류가 발생했습니다.",
        });
      }
    }),
  getTotalFiles: adminProcedure.query(async ({ ctx }) => {
    logger.info(
      { requestId: ctx.req.id },
      "protected.user.getTotalFiles 요청 시작",
    );

    try {
      const totalFiles = await adminService.getTotalFiles();

      logger.info(
        { requestId: ctx.req.id },
        "protected.user.getTotalFiles 요청 성공",
      );
      return { totalFiles };
    } catch (error) {
      logger.error(
        { requestId: ctx.req.id, error },
        "protected.user.getTotalFiles 요청 실패",
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "총 파일 수 조회 중 오류가 발생했습니다.",
      });
    }
  }),
  getTotalUsers: adminProcedure.query(async ({ ctx }) => {
    logger.info(
      { requestId: ctx.req.id },
      "protected.user.getTotalUsers 요청 시작",
    );

    try {
      const totalUsers = await adminService.getTotalUsers();

      logger.info(
        { requestId: ctx.req.id },
        "protected.user.getTotalUsers 요청 성공",
      );
      return { totalUsers };
    } catch (error) {
      logger.error(
        { requestId: ctx.req.id, error },
        "protected.user.getTotalUsers 요청 실패",
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "총 회원 수 조회 중 오류가 발생했습니다.",
      });
    }
  }),
  listDeletedUsers: adminProcedure
    .input(z.object({ period: z.enum(["1d", "1w"]) }))
    .query(async ({ input, ctx }) => {
      logger.info(
        { requestId: ctx.req.id },
        `protected.user.listDeletedUsers 요청 시작: ${input.period}`,
      );

      try {
        const deletedUsersCount = await adminService.getDeletedUsersCount(
          input.period,
        );

        logger.info(
          { requestId: ctx.req.id },
          `protected.user.listDeletedUsers 요청 성공: ${input.period}`,
        );
        return { deletedUsersCount };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "protected.user.listDeletedUsers 요청 실패",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "탈퇴한 회원 수 조회 중 오류가 발생했습니다.",
        });
      }
    }),
  recentFiles: adminProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.user?.id;
    if (!currentUserId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "로그인된 사용자가 없습니다.",
      });
    }
    const files = await adminService.getRecentUserFiles(currentUserId, 5);
    return files;
  }),
});
