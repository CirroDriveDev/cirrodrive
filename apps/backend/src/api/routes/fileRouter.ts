import { readFileSync } from "node:fs"; // fs 모듈
import { resolve } from "node:path"; // path 모듈
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { zfd } from "zod-form-data";
import {
  fileMetadataDTOSchema,
  fileMetadataPublicDTOSchema,
} from "@cirrodrive/schemas";
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

  /**
   * 파일 메타데이터 조회
   */
  getByCode: procedure
    .input(z.object({ code: z.string() }))
    .output(fileMetadataPublicDTOSchema)
    .query(async ({ input }) => {
      const metadata = await codeService.getCodeMetadata(input.code);

      if (!metadata) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "코드에 해당하는 파일을 찾을 수 없습니다.",
        });
      }

      return metadata;
    }),

  listByParentFolder: authedProcedure
    .input(
      z.object({
        folderId: z.number(),
      }),
    )
    .output(fileMetadataDTOSchema.array())
    .query(async ({ input, ctx }) => {
      const { folderId } = input;
      const { user } = ctx;

      const fileMetadataList =
        await fileService.listFileMetadataByParentFolder(folderId);

      // 로그인한 사용자의 파일 중 휴지통에 있지 않은 파일만 반환
      return fileMetadataList.filter(
        (file) => file.ownerId === user.id && !file.trashedAt,
      );
    }),

  upload: authedProcedure
    .input(
      zfd.formData({
        file: zfd.file(), // 업로드할 파일
        folderId: zfd.text().optional(), // 폴더 ID (선택적)
      }),
    )
    .output(
      z.object({
        fileId: z.number(), // 업로드된 파일 ID
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { file, folderId } = input;
      const { user } = ctx;
      logger.info({ requestId: ctx.req.id, user }, "파일 업로드 요청 시작");

      let metadata;
      try {
        let count = 1;
        let newFile = file;
        while (await fileService.sameNameExists(newFile.name, user.id)) {
          newFile = new File(
            [file],
            `${file.name.slice(0, file.name.lastIndexOf("."))} (${count})${file.name.slice(
              file.name.lastIndexOf("."),
            )}`,
          );
          count++;
        }

        metadata = await fileService.saveFile(newFile, user.id);
        // 폴더 ID가 주어진 경우 파일을 해당 폴더로 이동
        if (folderId) {
          metadata = await fileService.moveFile(metadata.id, Number(folderId));
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
  download: authedProcedure
    .input(
      z.object({
        fileId: z.number(), // 다운로드할 파일의 ID
      }),
    )
    .output(
      z.object({
        encodedFile: z.string(),
        fileName: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { fileId } = input;
      const { id: userId } = ctx.user; // 인증된 사용자의 ID

      try {
        // 파일 메타데이터 조회 (ownerId, codeString 포함)
        const fileMetadata = await fileService.getFileMetadata(fileId);

        if (!fileMetadata) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "파일을 찾을 수 없습니다.",
          });
        }

        // 파일 소유자 검증 (로그인한 사용자와 일치해야만 다운로드 가능)
        if (fileMetadata.ownerId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "파일에 접근할 권한이 없습니다.",
          });
        }

        // 파일 경로로 파일 읽기
        const filePath = resolve(fileMetadata.savedPath); // 경로를 절대경로로 변환
        const fileBuffer = readFileSync(filePath); // Buffer로 파일 읽기
        const encodedFile = fileBuffer.toString("base64"); // Base64로 변환

        return {
          encodedFile,
          fileName: fileMetadata.name, // 파일 이름
        };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error, fileId, userId },
          "파일 다운로드 중 오류 발생",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 다운로드 중 오류가 발생했습니다.",
        });
      }
    }),
  trash: authedProcedure
    .input(
      z.object({
        fileId: z.number(), // 휴지통으로 옮길 파일의 ID
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { fileId } = input;
      const { id: userId } = ctx.user; // 인증된 사용자의 ID

      try {
        // 파일 메타데이터 조회
        const fileMetadata = await fileService.getFileMetadata(fileId);

        if (!fileMetadata) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "파일을 찾을 수 없습니다.",
          });
        }

        // 파일 소유자 검증 (로그인한 사용자와 일치해야만 파일을 휴지통으로 이동 가능)
        if (fileMetadata.ownerId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "파일에 접근할 권한이 없습니다.",
          });
        }

        // 파일을 휴지통으로 이동
        await fileService.moveToTrash(fileId);

        return { success: true };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error, fileId, userId },
          "파일 휴지통 이동 중 오류 발생",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일을 휴지통으로 이동하는 중 오류가 발생했습니다.",
        });
      }
    }),

  updateFileName: authedProcedure
    .input(
      z.object({
        fileId: z.number(), // 수정할 파일 ID
        name: z.string(), // 새로운 파일 이름
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { fileId, name } = input;

      try {
        // 파일 이름 수정
        await fileService.updateFileName(fileId, name);

        return { success: true }; // 수정 성공 응답
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error, fileId },
          "파일 이름 수정 중 오류 발생",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 이름 수정 중 오류가 발생했습니다.",
        });
      }
    }),

  listTrashedFiles: authedProcedure
    .input(
      z.object({
        folderId: z.number(),
      }),
    )
    .output(fileMetadataDTOSchema.array())
    .query(async ({ input, ctx }) => {
      const { folderId } = input;
      const { user } = ctx;

      const fileMetadataList =
        await fileService.listFileMetadataByParentFolder(folderId);

      // 로그인한 사용자의 파일 중 휴지통에 있는 파일만 반환
      return fileMetadataList.filter(
        (file) => file.ownerId === user.id && file.trashedAt,
      );
    }),
  restoreFromTrash: authedProcedure
    .input(
      z.object({
        fileId: z.number(),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { fileId } = input;
      const { id: userId } = ctx.user;

      try {
        // 파일 메타데이터 조회
        const fileMetadata = await fileService.getFileMetadata(fileId);

        if (!fileMetadata) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "파일을 찾을 수 없습니다.",
          });
        }

        // 파일 소유자 검증
        if (fileMetadata.ownerId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "파일에 접근할 권한이 없습니다.",
          });
        }

        // 파일 복원
        await fileService.restoreFromTrash(fileId);

        return { success: true };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error, fileId, user: ctx.user },
          "파일 복원 중 오류 발생",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 복원 중 오류가 발생했습니다.",
        });
      }
    }),

  delete: authedProcedure
    .input(
      z.object({
        fileId: z.number(), // 삭제할 파일의 ID
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { fileId } = input;
      const { id: userId } = ctx.user;

      try {
        // 파일 메타데이터 조회
        const fileMetadata = await fileService.getFileMetadata(fileId);

        if (!fileMetadata) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "파일을 찾을 수 없습니다.",
          });
        }

        // 파일 소유자 검증
        if (fileMetadata.ownerId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "파일에 접근할 권한이 없습니다.",
          });
        }

        // 파일 삭제
        await fileService.deleteFile(fileId);

        return { success: true };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error, fileId, user: ctx.user },
          "파일 삭제 중 오류 발생",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 삭제 중 오류가 발생했습니다.",
        });
      }
    }),
  move: authedProcedure
    .input(
      z.object({
        fileId: z.number(),
        targetFolderId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { fileId, targetFolderId } = input;

      try {
        // 파일 이동 실행
        const updatedFile = await fileService.moveFile(fileId, targetFolderId);

        return { success: true, updatedFile };
      } catch (error) {
        if (error instanceof Error) {
          if (
            error.message.includes(
              "이미 같은 이름과 확장자의 파일이 존재합니다",
            )
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message: error.message,
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 이동 중 오류가 발생했습니다.",
          cause: error,
        });
      }
    }),
});
