import { z } from "zod";
import { fileMetadataDTOSchema } from "@cirrodrive/schemas";
import { router, procedure } from "@/loaders/trpc.loader.ts";
import { logger } from "@/loaders/logger.loader.ts";
import { container } from "@/loaders/inversify.loader.ts";
import { S3Service, S3_KEY_PREFIX } from "@/services/s3.service.ts";
import { s3PresignedPostSchema } from "@/schemas/s3.schema.ts";

const MAX_POST_FILE_SIZE = 1024 * 1024 * 1024; // 1GB
const s3Service = container.get<S3Service>(S3Service);

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
    .output(
      z.object({
        presignedPost: s3PresignedPostSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const { fileName, fileType } = input;
      logger.debug("getS3PresignedPost", {
        fileName,
        fileType,
      });

      const prefix = S3_KEY_PREFIX.PUBLIC_UPLOADS;
      const key = s3Service.generateS3ObjectKey(prefix, fileName);
      const presignedPost = await s3Service.generatePresignedPost({
        key,
        contentType: fileType,
        expires: 120,
        maxSizeInBytes: MAX_POST_FILE_SIZE,
      });

      logger.debug("S3 Presigned Post", {
        key,
        presignedPost,
      });

      return {
        presignedPost: s3PresignedPostSchema.parse(presignedPost),
      };
    }),
});
