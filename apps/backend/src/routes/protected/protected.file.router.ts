import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, adminProcedure } from "#loaders/trpc.loader";
import { container } from "#loaders/inversify.loader";
import { AdminService } from "#services/admin.service";
import { logger } from "#loaders/logger.loader";

const adminService = container.get<AdminService>(AdminService);

export const protectedFileRouter = router({
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
        "protected.file.listFiles 요청 시작",
      );

      try {
        const files = await adminService.getAllUserFiles({
          limit: input.limit,
          offset: input.offset,
          sortBy: input.sortBy,
          order: input.order,
        });

        logger.info(
          { requestId: ctx.req.id },
          "protected.file.listFiles 요청 성공",
        );
        return files;
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "protected.file.listFiles 요청 실패",
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

      const currentUserId = ctx.admin.id;

      try {
        const result = await adminService.deleteFile({
          fileId: input.fileId,
          currentUserId,
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
});
