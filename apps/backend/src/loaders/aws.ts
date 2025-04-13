import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";

export const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
});

export const sesClient = new SESClient({
  region: import.meta.env.VITE_AWS_REGION,
});
