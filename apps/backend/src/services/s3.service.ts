import path from "node:path";
import { injectable } from "inversify";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  HeadObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client } from "@/loaders/aws.loader.ts";
import { env } from "@/loaders/env.loader.ts";

const BUCKET_NAME = env.AWS_S3_BUCKET;
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
   * S3 PutObject Signed URL을 생성합니다.
   *
   * @param key - S3 객체 키
   * @param expiresIn - Signed URL의 유효 기간(초)
   * @returns PutObject Signed URL
   */
  public async getPutObjectSignedURL(
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
    const signedUploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return signedUploadUrl;
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
    const safeFilename = path.basename(filename).replace(/[^\w\-.]/g, "_");

    return `${prefix}/${timestamp}/${uuid}__${safeFilename}`;
  }

  /**
   * S3 객체의 메타데이터를 가져옵니다.
   *
   * @param key - S3 객체 키
   * @returns S3 객체 메타데이터
   */
  public async headObject(key: string): Promise<S3Metadata> {
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

  /**
   * S3 객체를 삭제합니다.
   *
   * @param key - S3 객체 키
   */
  public async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
  }

  /**
   * S3 객체를 삭제합니다.
   *
   * @param keys - S3 객체 키 배열
   */
  public async deleteObjects(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      throw new Error("No keys provided for deletion.");
    }

    const command = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    });

    await s3Client.send(command);
  }

  public async copyObject(sourceKey: string, targetKey: string): Promise<void> {
    const command = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: targetKey,
    });

    await s3Client.send(command);
  }
}
