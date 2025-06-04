import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { s3PresignedPostSchema } from "@cirrodrive/schemas/s3";
import { fileMetadataDTOSchema } from "@cirrodrive/schemas/file-metadata";
import { router, procedure } from "#loaders/trpc.loader";
import { logger } from "#loaders/logger.loader";
import { container } from "#loaders/inversify.loader";
import { S3Service } from "#services/s3.service";
import { FileUploadService } from "#services/file.upload.service";
import { FileAccessCodeService } from "#services/file-access-code.service";
import { StorageService } from "#services/storage.service";

const s3Service = container.get<S3Service>(S3Service);
const fileAccessCodeService = container.get<FileAccessCodeService>(
  FileAccessCodeService,
);
const fileUploadService = container.get<FileUploadService>(FileUploadService);
const storageService = container.get<StorageService>(StorageService);

export const fileUploadRouter = router({
  /**
   * S3 Presigned Post를 생성합니다.
   *
   * @param fileName - 업로드할 파일의 이름
   * @param fileType - 업로드할 파일의 MIME 타입
   * @param fileSize - 업로드할 파일의 크기 (bytes)
   */
  getS3PresignedPost: procedure
    .input(
      z.object({
        fileName: fileMetadataDTOSchema.shape.name,
        fileType: s3PresignedPostSchema.shape.fields.shape["Content-Type"],
        fileSize: z.number().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { fileName, fileType, fileSize } = input;
      const { user } = ctx;
      const userId = user?.id ?? "anonymous";

      logger.debug("getS3PresignedPost", {
        fileName,
        fileType,
        fileSize,
      });

      // 인증된 사용자의 경우 할당량 검증
      if (user) {
        const storageStatus = await storageService.getUsage(user.id);
        const newUsage = storageStatus.used + fileSize;

        if (newUsage > storageStatus.quota) {
          const remainingBytes = storageStatus.quota - storageStatus.used;
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `저장 공간이 부족합니다. 사용 가능한 용량: ${Math.max(0, remainingBytes)} bytes`,
          });
        }

        logger.info("Storage quota check passed", {
          userId: user.id,
          currentUsage: storageStatus.used,
          fileSize,
          newUsage,
          quota: storageStatus.quota,
        });
      }

      const presignedPost = await s3Service.createPresignedPost({
        fileName,
        contentType: fileType,
        userId,
      });

      logger.debug("S3 Presigned Post", {
        fileName,
        contentType: fileType,
        fileSize,
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
      if ((!input.folderId && user) || (input.folderId && !user)) {
        throw new Error(
          "Folder ID must be provided if the user is authenticated, or not provided if the user is anonymous.",
        );
      }

      const { file } = await fileUploadService.completeUpload({
        name: input.fileName,
        key: input.key,
        ...(user && {
          parentFolderId: input.folderId,
          userId: user.id,
        }),
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
});
