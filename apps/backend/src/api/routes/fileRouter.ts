import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { zfd } from "zod-form-data";
import { router, procedure, authedProcedure } from "@/loaders/trpc.ts";
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
  download: procedure
    .input(
      z.object({
        userId: z.number(), // 사용자 ID
        fileId: z.number(), // 다운로드할 파일의 ID
      }),
    )
    .output(
      z.object({
        encodedFile: z.string(),
        fileName: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, fileId } = input;

      // 회원 인증 확인
      let user;
      try {
        user = await userService.get(userId);
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

      // 파일 확인 및 사용자 드라이브에서 파일 찾기
      let file;
      try {
        file = await fileService.getFileByIdAndUser(fileId, userId); // 파일과 해당 사용자가 일치하는지 확인
        if (!file) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "파일을 찾을 수 없습니다.",
          });
        }
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "파일 다운로드 실패");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 다운로드 중 오류가 발생했습니다.",
        });
      }

      // 파일 다운로드
      try {
        logger.info({ requestId: ctx.req.id }, "file.download 요청 성공");

        // 파일 경로로 파일 읽기
        const filePath = resolve(file.savedPath); // 경로를 절대경로로 변환

        // 파일을 Buffer로 읽어서 Base64로 인코딩
        const fileBuffer = readFileSync(filePath); // Buffer로 파일 읽기
        const fileString = fileBuffer.toString("base64"); // Base64로 변환

        return {
          encodedFile: fileString,
          fileName: file.name,
        };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "파일 다운로드 중 오류 발생",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 다운로드 중 오류가 발생했습니다.",
        });
      }
    }),
});
