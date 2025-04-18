import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  fileMetadataDTOSchema,
  fileMetadataPublicDTOSchema,
} from "@cirrodrive/schemas";
import { router, procedure, authedProcedure } from "@/loaders/trpc.loader.ts";
import { logger } from "@/loaders/logger.loader.ts";
import { container } from "@/loaders/inversify.loader.ts";
import { FileService } from "@/services/file.service.ts";
import { CodeService } from "@/services/code.service.ts";
import { S3Service, S3_KEY_PREFIX } from "@/services/s3.service.ts";

const fileService = container.get<FileService>(FileService);
const codeService = container.get<CodeService>(CodeService);
const s3Service = container.get<S3Service>(S3Service);

export const fileRouter = router({
  /**
   * S3 Presigned Upload URL을 생성합니다.
   *
   * @param fileName - 업로드할 파일의 이름
   * @returns Presigned Upload URL
   */
  getS3PresignedUploadURL: procedure
    .input(
      z.object({
        fileName: z.string(),
      }),
    )
    .output(
      z.object({
        presignedUploadURL: z.string(),
        key: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { fileName } = input;
      const { user } = ctx;
      const prefix =
        user ? S3_KEY_PREFIX.USER_UPLOADS : S3_KEY_PREFIX.PUBLIC_UPLOADS;

      const key = s3Service.generateS3ObjectKey(prefix, fileName);
      const presignedUploadURL = await s3Service.getPutObjectSignedURL(key);

      return { presignedUploadURL, key };
    }),

  completeUpload: procedure
    .input(
      z.object({
        key: z.string(),
        folderId: z.number().optional(),
      }),
    )
    .output(
      z.object({
        fileId: z.number(),
        code: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { key, folderId } = input;
      const { user } = ctx;

      if (user && !folderId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "로그인한 사용자는 folderId를 제공해야 합니다.",
        });
      }

      // 존재 확인
      const metadata = await s3Service.headObject(key);

      if (!metadata) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "파일을 찾을 수 없습니다.",
        });
      }

      const { id: fileId } = await fileService.save({
        metadata,
        ownerId: user?.id,
      });

      const { codeString: code } = await codeService.createCode({
        fileId,
      });

      return {
        fileId,
        code,
      };
    }),

  download: procedure
    .input(
      z.object({
        fileId: z.number(),
      }),
    )
    .output(
      z.object({
        url: z.string(),
      }),
    )
    .query(() => {
      throw new Error("Not implemented");
    }),

  /**
   * 파일 메타데이터 조회
   */
  getByCode: procedure
    .input(z.object({ code: z.string() }))
    .output(fileMetadataPublicDTOSchema)
    .query(async ({ input }) => {
      const metadata = await codeService.getCodeMetadata({
        codeString: input.code,
      });

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

      const fileMetadataList = await fileService.listFileMetadataByParentFolder(
        {
          parentFolderId: folderId,
        },
      );

      // 로그인한 사용자의 파일 중 휴지통에 있지 않은 파일만 반환
      return fileMetadataList.filter(
        (file) => file.ownerId === user.id && !file.trashedAt,
      );
    }),

  saveToAccount: authedProcedure
    .input(
      z.object({
        code: z.string(),
        folderId: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { code, folderId } = input;
      const { user } = ctx;
      try {
        const fileMetadata = await codeService.getCodeMetadata({
          codeString: input.code,
        });
        if (!fileMetadata) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "코드에 해당하는 파일을 찾을 수 없습니다.",
          });
        }

        const metadata = await fileService.copy({
          fileId: fileMetadata.id,
          targetFolderId: folderId ?? user.rootFolderId,
        });

        return { fileId: metadata.id };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error, code },
          "파일 저장 중 오류 발생",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 저장 중 오류가 발생했습니다.",
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
        const fileMetadata = await fileService.getFileMetadata({
          fileId,
        });

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
        await fileService.moveToTrash({
          fileId: input.fileId,
          userId,
        });

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
        await fileService.rename({
          fileId,
          name,
        });

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

      const fileMetadataList = await fileService.listFileMetadataByParentFolder(
        {
          parentFolderId: folderId,
        },
      );

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
        // 파일 ���타데이터 조회
        const fileMetadata = await fileService.getFileMetadata({
          fileId,
        });

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
        await fileService.restoreFromTrash({
          fileId: input.fileId,
        });

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
        const fileMetadata = await fileService.getFileMetadata({
          fileId,
        });

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
        await fileService.deleteFile({
          fileId: input.fileId,
        });

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
        const updatedFile = await fileService.moveFile({
          fileId,
          targetFolderId,
        });

        return { success: true, updatedFile };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 이동 중 오류가 발생했습니다.",
          cause: error,
        });
      }
    }),

  get: authedProcedure
    .input(
      z.object({
        fileId: z.number(), // 조회할 파일 ID
      }),
    )
    .output(fileMetadataDTOSchema) // 메타데이터를 반환하는 스키마
    .query(async ({ input, ctx }) => {
      const { fileId } = input;
      const { user } = ctx;

      try {
        // 파일 메타데이터 조회
        const fileMetadata = await fileService.getFileMetadata({
          fileId,
        });

        if (!fileMetadata) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "파일을 찾을 수 없습니다.",
          });
        }

        // 파일 소유자 검증 (로그인한 사용자와 일치해야만 접근 가능)
        if (fileMetadata.ownerId !== user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "파일에 접근할 권한이 없습니다.",
          });
        }

        return fileMetadata; // 메타데이터 반환
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error, fileId, userId: user.id },
          "파일 메타데이터 조회 중 오류 발생",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "파일 메타데이터 조회 중 오류가 발생했습니다.",
        });
      }
    }),
});
