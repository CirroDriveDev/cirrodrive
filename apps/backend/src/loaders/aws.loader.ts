import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";
import { env } from "#loaders/env.loader";
import { logger as baseLogger } from "#loaders/logger.loader";

const logger = baseLogger.child({ prefix: "aws" });
logger.info("Loading AWS SDK...");

if (env.DEV || env.TEST) {
  logger.info(`Running in ${env.MODE} mode. Using MinIO for S3.`);
}

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  ...(!env.PROD && {
    credentials: {
      accessKeyId: env.AWS_S3_ACCESS_KEY!,
      secretAccessKey: env.AWS_S3_SECRET_KEY!,
    },
    endpoint: env.AWS_S3_ENDPOINT!,
    forcePathStyle: true,
  }),
});

export const sesClient = new SESClient({
  region: env.AWS_REGION,
});

if (env.DEV || env.TEST) {
  logger.info("Trying to create bucket...");

  try {
    const { CreateBucketCommand } = await import("@aws-sdk/client-s3");
    await s3Client.send(new CreateBucketCommand({ Bucket: env.AWS_S3_BUCKET }));
  } catch (error) {
    if ((error as Error).name !== "BucketAlreadyOwnedByYou") {
      logger.error(
        `Failed to create bucket ${env.AWS_S3_BUCKET}: ${(error as Error).message}`,
      );
      throw error;
    } else {
      logger.info(
        `Bucket "${env.AWS_S3_BUCKET}" already exists and is owned by you.`,
      );
    }
  }
}

logger.info("AWS SDK loaded successfully.");
