import path from "node:path";
import { injectable } from "inversify";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/loaders/aws.ts";

const BUCKET_NAME = import.meta.env.VITE_AWS_S3_BUCKET;
export const S3_KEY_PREFIX = {
  USER_UPLOADS: "user-uploads",
  PUBLIC_UPLOADS: "public-uploads",
} as const;
export interface S3Metadata {
  name: string;
  extension: string;
  size: number;
  key: string;
  hash: string;
}

@injectable()
export class S3Service {
  /**
   * S3 Presigned Upload URL을 생성합니다.
   *
   * @param key - S3 객체 키
   * @param expiresIn - Presigned URL의 유효 기간(초)
   * @returns Presigned Upload URL
   */
  public async generateS3PresignedUploadURL(
    key: string,
    expiresIn = 60 * 5, // 5분
  ): Promise<string> {
    if (import.meta.env.DEV) {
      return `https://localhost/${key}`;
    }
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const presignedUploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return presignedUploadUrl;
  }

  /**
   * S3 객체의 키를 생성합니다.
   *
   * @param prefix - S3 객체의 접두사
   * @param filename - 파일 이름
   * @returns S3 객체 키
   */
  public generateS3ObjectKey(
    prefix: (typeof S3_KEY_PREFIX)[keyof typeof S3_KEY_PREFIX],
    filename: string,
  ): string {
    const uuid = crypto.randomUUID();
    const timestamp = new Date().toISOString().split("T")[0];

    return `${prefix}/${timestamp}/${uuid}__${filename}`;
  }

  /**
   * S3 객체의 메타데이터를 가져옵니다.
   *
   * @param key - S3 객체 키
   * @returns S3 객체 메타데이터
   */
  public async fetchS3ObjectMetadata(key: string): Promise<S3Metadata> {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const data = await s3Client.send(command);
    if (data.Metadata === undefined) {
      throw new Error("Metadata is undefined");
    }
    if (data.Metadata.Name === undefined) {
      throw new Error("Metadata Name is undefined");
    }
    if (data.ContentLength === undefined) {
      throw new Error("Metadata ContentLength is undefined");
    }
    if (data.ChecksumCRC64NVME === undefined) {
      throw new Error("Metadata ChecksumCRC64NVME is undefined");
    }

    const extension = path.extname(data.Metadata.Name);

    const metadata: S3Metadata = {
      name: data.Metadata.Name,
      extension,
      size: data.ContentLength,
      key,
      hash: data.ChecksumCRC64NVME,
    };

    return metadata;
  }
}
