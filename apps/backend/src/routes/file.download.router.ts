import { z } from "zod";
import { authedProcedure, router } from "#loaders/trpc.loader";
import { logger } from "#loaders/logger.loader";
import { container } from "#loaders/inversify.loader";
import { CloudFrontService } from "#services/cloud-front.service";
import { env } from "#loaders/env.loader";
import { S3Service } from "#services/s3.service";

const s3Service = container.get(S3Service);
const cloudFrontService = container.get(CloudFrontService);

export const fileDownloadRouter = router({
  /**
   * 파일 다운로드를 위한 URL을 생성합니다.
   *
   * @param fileId - 다운로드할 파일의 ID
   */
  getDownloadUrl: authedProcedure
    .input(z.object({ fileId: z.string() }))
    .output(z.object({ downloadUrl: z.string() }))
    .query(async ({ input, ctx }) => {
      const { fileId } = input;
      const { user } = ctx;

      logger.debug("getDownloadUrl", { fileId, userId: user?.id });

      // 개발 환경인 경우 S3에서 직접 다운로드 URL을 생성합니다.
      if (env.DEV) {
        const downloadUrl = await s3Service.getPutObjectSignedURL(fileId);
        return { downloadUrl };
      }

      const downloadUrl = cloudFrontService.createSignedUrl(`/files/${fileId}`);

      logger.debug("Generated download URL", {
        downloadUrl,
      });

      return { downloadUrl };
    }),
});
