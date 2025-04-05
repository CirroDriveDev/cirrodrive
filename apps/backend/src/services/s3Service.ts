import { injectable } from "inversify";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/loaders/aws.ts";

const BUCKET_NAME = import.meta.env.VITE_AWS_S3_BUCKET;

@injectable()
export class S3Service {
  /**
   * S3 Presigned URL을 생성합니다.
   *
   * @param key - S3 객체 키
   * @param contentType - S3 객체의 Content-Type
   * @param expiresIn - Presigned URL의 유효 기간(초)
   * @returns Presigned URL
   */
  public async getSignedUrl(
    key: string,
    contentType: string,
    expiresIn = 60 * 5, // 5분
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    const signedS3Url = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return signedS3Url;
  }

  /**
   * S3 객체의 키를 생성합니다.
   *
   * @param userId - 객체 소유자 ID
   * @param parentFolderId - 부모 폴더 ID
   * @param filename - 파일 이름
   * @returns S3 객체 키
   */
  public getKey(
    userId: string,
    parentFolderId: string,
    filename: string,
  ): string {
    const uuid = crypto.randomUUID();
    return `user-uploads/${userId}/${parentFolderId}/${uuid}_${filename}`;
  }
}
