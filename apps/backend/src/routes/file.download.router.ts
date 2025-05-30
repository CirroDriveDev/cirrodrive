import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { procedure, router } from "#loaders/trpc.loader";
import { logger } from "#loaders/logger.loader";
import { container } from "#loaders/inversify.loader";
import { CloudFrontService } from "#services/cloud-front.service";
import { env } from "#loaders/env.loader";
import { S3Service } from "#services/s3.service";
import { FileService } from "#services/file.service";

const fileService = container.get(FileService);
const s3Service = container.get(S3Service);
const cloudFrontService = container.get(CloudFrontService);

export const fileDownloadRouter = router({
  /**
   * 파일 다운로드를 위한 URL을 생성합니다.
   *
   * @param fileId - 다운로드할 파일의 ID
   */
  getDownloadUrl: procedure
    .input(
      z.object({
        fileId: z.string().optional(),
        code: z.string().optional(),
      }),
    )
    .output(z.object({ downloadUrl: z.string() }))
    .query(async ({ input, ctx }) => {
      const { fileId, code } = input;
      const { user } = ctx;

      logger.debug("getDownloadUrl", { fileId, userId: user?.id });

      if (!fileId && !code) {
        logger.error("File ID or code is required for download URL", {
          fileId,
          code,
        });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File ID or code is required to generate a download URL.",
        });
      }

      if (fileId && code) {
        logger.error("Both fileId and code provided", { fileId, code });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot provide both fileId and code.",
        });
      }

      if (!user && !code) {
        logger.error("Unauthorized access to file download URL", { fileId });
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to download files.",
        });
      }

      let file;

      if (code && !fileId) {
        // 코드로 파일을 찾습니다.
        logger.debug("Searching file by code", { code });
        file = await fileService.getFileByCode({ codeString: code });
      }

      if (fileId && !code) {
        // 파일 ID로 파일을 찾습니다.
        logger.debug("Searching file by fileId", { fileId });
        file = await fileService.getFileById({ fileId });
      }

      if (!file) {
        logger.error("File not found", { fileId, code });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found.",
        });
      }

      // 개발 환경인 경우 S3에서 직접 다운로드 URL을 생성합니다.
      if (env.DEV) {
        const downloadUrl = await s3Service.getDownloadSignedURL(file.key);
        return { downloadUrl };
      }

      const downloadUrl = cloudFrontService.createSignedUrl(file.key);

      logger.debug("Generated download URL", {
        downloadUrl,
      });

      return { downloadUrl };
    }),
});
