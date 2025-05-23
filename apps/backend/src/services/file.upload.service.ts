// src/services/file.upload.service.ts
import { inject, injectable } from "inversify";
import { z } from "zod";
import { fileMetadataDTOSchema, s3PresignedPostSchema } from "@cirrodrive/schemas";
import { S3Service, S3_KEY_PREFIX } from "@/services/s3.service.ts";

const MAX_POST_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

@injectable()
export class FileService {
  constructor(
    @inject(S3Service) private readonly s3Service: S3Service,
  ) {}

  async generatePresignedPost(fileName: string, fileType: string) {
    const prefix = S3_KEY_PREFIX.PUBLIC_UPLOADS;
    const key = this.s3Service.generateS3ObjectKey(prefix, fileName);

    const presignedPost = await this.s3Service.generatePresignedPost({
      key,
      contentType: fileType,
      expires: 120,
      maxSizeInBytes: MAX_POST_FILE_SIZE,
    });

    return s3PresignedPostSchema.parse(presignedPost);
  }

  async saveFileMetadata(_metadata: z.infer<typeof fileMetadataDTOSchema>): Promise<void> {
  // TODO: 실제 구현 예정
  }

}
