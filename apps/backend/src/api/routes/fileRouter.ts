import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { zfd } from "zod-form-data";
import { router, procedure, authedProcedure } from "@/loaders/trpc.ts";
import { logger } from "@/loaders/logger.ts";
import { container } from "@/loaders/inversify.ts";
import { FileService } from "@/services/fileService.ts";
import { CodeService } from "@/services/codeService.ts";

const fileService = container.get<FileService>(FileService);
const codeService = container.get<CodeService>(CodeService);

export const fileRouter = router({
  uploadPublic: procedure
    .input(
      zfd.formData({
        file: zfd.file(),
      }),
    )
    .output(
      z.object({
        code: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "file.upload 요청 시작");
      let metadata;
      let code;
      try {
        metadata = await fileService.saveFile(input.file);
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "file.upload 요청 실패");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 업로드 중 오류가 발생했습니다.",
        });
      }
      try {
        code = await codeService.createCode(metadata.id);
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "file.upload 요청 실패");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 업로드 중 오류가 발생했습니다.",
        });
      }

      logger.info({ requestId: ctx.req.id }, "file.upload 요청 성공");

      return {
        code: code.codeString,
      };
    }),

  downloadByCode: procedure
    .input(
      z.object({
        codeString: z.string(),
      }),
    )
    .output(
      z.object({
        encodedFile: z.string(),
        fileName: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "file.download 요청 시작");

      try {
        const file = await fileService.getFileByCode(input.codeString);

        logger.info({ requestId: ctx.req.id }, "file.download 요청 성공");
        const fileArrayBuffer = await file.arrayBuffer();
        const fileString = Buffer.from(fileArrayBuffer).toString("base64");
        return {
          encodedFile: fileString,
          fileName: file.name,
        };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "file.download 요청 실패",
        );

        throw error;
      }
    }),

  upload: authedProcedure
    .input(
      z.object({
        file: zfd.file(), // 업로드할 파일
        folderId: z.number().optional(), // 폴더 ID (선택적)
      }),
    )
    .output(
      z.object({
        fileId: z.number(), // 업로드된 파일 ID
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { file } = input;
      const { user } = ctx;
      logger.info({ requestId: ctx.req.id, user }, "파일 업로드 요청 시작");

      let metadata;
      try {
        metadata = await fileService.saveFile(file, user.id);
        // 폴더 ID가 주어진 경우 파일을 해당 폴더로 이동
        if (input.folderId) {
          metadata = await fileService.moveFile(metadata.id, input.folderId);
        }
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "파일 업로드 실패");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 업로드 중 오류가 발생했습니다.",
        });
      }

      logger.info({ requestId: ctx.req.id }, "파일 업로드 성공");

      return {
        fileId: metadata.id,
      };
    }),
});
