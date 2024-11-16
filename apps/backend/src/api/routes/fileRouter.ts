import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { zfd } from "zod-form-data";
import { router, procedure } from "@/loaders/trpc.ts";
import { logger } from "@/loaders/logger.ts";
import { container } from "@/loaders/inversify.ts";
import { FileService } from "@/services/fileService.ts";
import { CodeService } from "@/services/codeService.ts";
import { UserService } from "@/services/userService.ts";

const fileService = container.get<FileService>(FileService);
const codeService = container.get<CodeService>(CodeService);
const userService = container.get<UserService>(UserService);

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
  uploadFileToUserDrive: procedure
    .input(
      z.object({
        userId: z.number(), // 사용자 ID
        file: zfd.file(), // 업로드할 파일
        folderId: z.number().optional(), // 폴더 ID (선택적)
      }),
    )
    .output(
      z.object({
        fileId: z.number(), // 업로드된 파일 ID
        userId: z.number(), // 파일을 업로드한 사용자 ID
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, file, folderId } = input;
      logger.info({ requestId: ctx.req.id, userId }, "파일 업로드 요청 시작");

      // 1. 사용자 인증 확인
      let user;
      try {
        user = await userService.get(userId); // 회원 확인
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "사용자를 찾을 수 없습니다.",
          });
        }
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "사용자 인증 실패");
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "사용자가 인증되지 않았습니다.",
        });
      }

      // 2. 파일 저장 처리 (회원 개인 저장공간)
      let metadata;
      try {
        metadata = await fileService.saveFileToUserDrive(
          userId,
          file,
          folderId,
        );
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
        userId,
      };
    }),
});
