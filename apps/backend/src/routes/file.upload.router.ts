import { z } from "zod";
import { s3PresignedPostSchema } from "@cirrodrive/schemas/s3";
import { fileMetadataDTOSchema } from "@cirrodrive/schemas/file-metadata";
import { router, procedure } from "#loaders/trpc.loader";
import { logger } from "#loaders/logger.loader";
import { container } from "#loaders/inversify.loader";
import { S3Service } from "#services/s3.service";
import { FileUploadService } from "#services/file.upload.service";
import { FileAccessCodeService } from "#services/file-access-code.service";

const s3Service = container.get<S3Service>(S3Service);
const fileAccessCodeService = container.get<FileAccessCodeService>(
  FileAccessCodeService,
);
const fileUploadService = container.get<FileUploadService>(FileUploadService);

export const fileUploadRouter = router({
  /**
   * S3 Presigned Post를 생성합니다.
   *
   * @param fileName - 업로드할 파일의 이름
   * @param fileType - 업로드할 파일의 MIME 타입
   */
  getS3PresignedPost: procedure
    .input(
      z.object({
        fileName: fileMetadataDTOSchema.shape.name,
        fileType: s3PresignedPostSchema.shape.fields.shape["Content-Type"],
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { fileName, fileType } = input;
      const { user } = ctx;
      const userId = user?.id ?? "anonymous";

      logger.debug("getS3PresignedPost", {
        fileName,
        fileType,
      });

      const presignedPost = await s3Service.createPresignedPost({
        fileName,
        contentType: fileType,
        userId,
      });

      logger.debug("S3 Presigned Post", {
        fileName,
        contentType: fileType,
        userId,
        presignedPost,
      });

      return {
        presignedPost,
      };
    }),

  /**
   * S3 업로드 완료 후, 파일 메타데이터를 저장합니다.
   *
   * @param key - 업로드된 S3 오브젝트의 key
   * @param name - 파일명
   * @param size - 파일 크기 (bytes)
   * @param extension - 파일 확장자
   * @param folderId - (선택) 부모 폴더 ID
   */
  completeUpload: procedure
    .input(
      z.object({
        fileName: fileMetadataDTOSchema.shape.name,
        key: z.string(),
        folderId: z.string().optional(),
      }),
    )
    .output(
      z.object({
        fileId: z.string(),
        code: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const ownerId = user?.id ?? "anonymous";

      const file = await fileUploadService.completeUpload({
        ownerId,
        name: input.fileName,
        key: input.key,
        parentFolderId: input.folderId,
      });

      if (!user) {
        const code = await fileAccessCodeService.create({ fileId: file.id });

        return {
          fileId: file.id,
          code: code.code,
        };
      }

      return {
        fileId: file.id,
      };
    }),

  completeUploadAnonymous: procedure
    .input(
      z.object({
        fileName: fileMetadataDTOSchema.shape.name,
        key: z.string(),
        folderId: z.string().optional(),
      }),
    )
    .output(
      z.object({
        fileId: z.string(),
        code: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { file, code } = await fileUploadService.completeUploadAnonymous({
        name: input.fileName,
        key: input.key,
        parentFolderId: input.folderId,
      });

      return {
        fileId: file.id,
        code: code.code,
      };
    }),
});
