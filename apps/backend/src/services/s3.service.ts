import path from "node:path";
import { inject, injectable } from "inversify";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  createPresignedPost,
  type PresignedPost,
} from "@aws-sdk/s3-presigned-post";
import {
  HeadObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import type { Logger } from "pino";
import { z } from "zod";
import { s3Client } from "#loaders/aws.loader";
import { env } from "#loaders/env.loader";
import { Symbols } from "#types/symbols";

const BUCKET_NAME = env.AWS_S3_BUCKET;

const MAX_GUEST_FILE_SIZE = 1024 * 1024 * 1024; // 1GB
const MAX_USER_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
const S3_POST_EXPIRES = 60; // 1 minute

export const S3MetadataSchema = z
  .object({
    userid: z.string(),
  })
  .transform((data) => {
    return {
      userId: data.userid,
    };
  });

export const S3HeadObjectSchema = z.object({
  Metadata: S3MetadataSchema,
  ContentLength: z.coerce.number(),
});

export type S3Metadata = z.infer<typeof S3MetadataSchema>;
export type S3HeadObject = z.infer<typeof S3HeadObjectSchema>;

interface GenerateKeyInput {
  userId: string;
  fileName: string;
}

interface CreatePresignedPostInput {
  fileName: string;
  contentType: string;
  userId?: string;
}

export interface S3ServiceInterface {
  createPresignedPost: (
    input: CreatePresignedPostInput,
  ) => Promise<PresignedPost>;
  getPutObjectSignedURL: (key: string, expiresIn?: number) => Promise<string>;
  generateKey: (input: GenerateKeyInput) => string;
  headObject: (key: string) => Promise<S3HeadObject>;
  deleteObject: (key: string) => Promise<void>;
  deleteObjects: (keys: string[]) => Promise<void>;
  copyObject: (sourceKey: string, targetKey: string) => Promise<void>;
  objectExists: (key: string) => Promise<boolean>;
}

@injectable()
export class S3Service implements S3ServiceInterface {
  constructor(@inject(Symbols.Logger) private logger: Logger) {
    this.logger = logger.child({ serviceName: "S3Service" });
  }

  /**
   * S3에 파일을 직접 업로드할 수 있도록 presigned POST 정책을 생성합니다.
   *
   * @param fileName - 업로드할 파일의 이름
   * @param contentType - 업로드할 파일의 MIME 타입
   * @param userId - 업로드하는 사용자의 ID (선택적, 기본값은 "anonymous")
   * @returns 업로드에 필요한 URL과 form 필드가 포함된 `PresignedPost` 객체를 반환하는 Promise
   */
  public async createPresignedPost(
    input: CreatePresignedPostInput,
  ): Promise<PresignedPost> {
    const { fileName, contentType } = input;
    this.logger.debug("generatePresignedPost", input);
    const userId = input.userId ?? "anonymous";
    const isGuest = Boolean(input.userId);

    const key = this.generateKey({ userId, fileName });

    const presignedPost = await createPresignedPost(s3Client, {
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Expires: S3_POST_EXPIRES,
      Fields: {
        "Content-Type": contentType,
        "x-amz-meta-userId": userId,
      },
      Conditions: [
        ["starts-with", "$key", `uploads/${userId}`],
        ["starts-with", "$Content-Type", contentType],
        ["eq", "$x-amz-meta-userId", userId],
        [
          "content-length-range",
          0,
          isGuest ? MAX_GUEST_FILE_SIZE : MAX_USER_FILE_SIZE,
        ],
      ],
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
   * S3 객체 키를 생성합니다.
   *
   * @param userId - 사용자 ID
   * @param fileName - 파일 이름
   * @returns S3 객체 키
   */
  public generateKey(input: { userId: string; fileName: string }): string {
    const { userId, fileName } = input;

    const uuid = crypto.randomUUID();
    const timestamp = new Date().toISOString().split("T")[0];
    let ext = path.extname(fileName).toLowerCase().replace(/^\./, "");
    if (!ext) ext = "bin";
    return `uploads/${userId}/${timestamp}-${uuid}.${ext}`;
  }

  /**
   * S3 객체의 메타데이터를 가져옵니다.
   *
   * @param key - S3 객체 키
   * @returns S3 객체 메타데이터
   */
  public async headObject(key: string) {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    try {
      const data = await s3Client.send(command);
      this.logger.debug(data);
      return S3HeadObjectSchema.parse(data);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Not Found")) {
          throw new Error("File not found in S3.");
        }
      }
      throw error;
    }
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

  /**
   * S3 객체가 존재하는지 확인합니다.
   *
   * @param key - S3 객체 키
   * @returns 객체가 존재하면 true, 아니면 false
   */
  public async objectExists(key: string): Promise<boolean> {
    try {
      await this.headObject(key);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === "NotFound") {
        return false;
      }
      this.logger.error("Error checking object existence", { key, error });
      throw error;
    }
  }

  /**
   * S3 객체를 다운로드하는 Signed URL을 생성합니다.
   */
  public async getDownloadSignedURL(
    key: string,
    expiresIn = 60 * 5, // 5분
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const signedDownloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return signedDownloadUrl;
  }
    /**
   * S3에서 비회원 파일(키 목록)을 삭제합니다.
   * 하루 지난 파일을 판단하는 로직은 이 서비스 바깥에서 처리되어야 합니다.
   *
   * @param keys - 삭제할 S3 객체 키 배열
   */
  public async deleteExpiredGuestFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      this.logger.info("삭제할 비회원 S3 파일이 없습니다.");
      return;
    }

    this.logger.info({ count: keys.length }, "비회원 S3 파일 삭제 시작");

    try {
      await this.deleteObjects(keys);

      this.logger.info({ count: keys.length }, "비회원 S3 파일 삭제 완료");
    } catch (error) {
      this.logger.error({ error }, "비회원 S3 파일 삭제 실패");
      throw error;
    }
  }

}
