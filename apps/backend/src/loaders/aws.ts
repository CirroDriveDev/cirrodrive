import { S3 } from "aws-sdk";
import { SESClient } from "@aws-sdk/client-ses";

export const s3 = new S3({
  region: import.meta.env.VITE_AWS_REGION,
});

export const sesClient = new SESClient({
  region: import.meta.env.VITE_AWS_REGION,
});
