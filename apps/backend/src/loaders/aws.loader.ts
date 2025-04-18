import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";
import { env } from "@/loaders/env.loader.ts";

export const s3Client = new S3Client({
  region: env.AWS_REGION,
});

export const sesClient = new SESClient({
  region: env.AWS_REGION,
});
