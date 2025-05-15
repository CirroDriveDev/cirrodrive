import path from "node:path";
import { inject, injectable } from "inversify";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost, PresignedPost } from "@aws-sdk/s3-presigned-post";
import {
  HeadObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import type { Logger } from "pino";
import { s3Client } from "@/loaders/aws.loader.ts";
import { env } from "@/loaders/env.loader.ts";
import { Symbols } from "@/types/symbols.ts";

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
  constructor(@inject(Symbols.Logger) private logger: Logger) {
    this.logger = logger.child({ serviceName: "S3Service" });
  }

  /**
   * S3에 파일을 직접 업로드할 수 있도록 presigned POST 정책을 생성합니다.
   *
   * @param params - presigned POST 생성을 위한 파라미터
   * @param key - 업로드할 S3 객체의 키
   * @param expires - (선택) presigned POST의 만료 시간(초). 기본값은 60초입니다.
   * @param contentType - (선택) 업로드할 파일의 Content-Type
   * @param maxSizeInBytes - (선택) 업로드 파일의 최대 허용 크기(바이트). 기본값은 10MB입니다.
   * @returns 업로드에 필요한 URL과 form 필드가 포함된 `PresignedPost` 객체를 반환하는 Promise
   */
  public async generatePresignedPost({
    key,
    expires = 60, // 초 단위, 기본 1분
    contentType,
    maxSizeInBytes,
  }: {
    key: string;
    expires?: number;
    contentType?: string;
    maxSizeInBytes?: number;
  }): Promise<PresignedPost> {
    this.logger.debug("generatePresignedPost", {
      key,
      expires,
      contentType,
      maxSizeInBytes,
    });

    const presignedPost = await createPresignedPost(s3Client, {
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Expires: expires,
      Conditions: [
        ["starts-with", "$Content-Type", contentType ?? ""],
        ["content-length-range", 0, maxSizeInBytes ?? 10 * 1024 * 1024], // 10MB
      ],
      Fields: {
        "Content-Type": contentType ?? "application/octet-stream",
      },
    });

    this.logger.debug("generatePresignedPost", {
      presignedPost,
    });

    return presignedPost;
  }

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
