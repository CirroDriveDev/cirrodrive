// src/services/file.upload.service.ts
import { inject, injectable } from "inversify";
import { z } from "zod";
import { s3PresignedPostSchema } from "@cirrodrive/schemas/s3";
import { fileMetadataDTOSchema } from "@cirrodrive/schemas/file-metadata";
import { S3Service, S3_KEY_PREFIX } from "#services/s3.service.js";
import { FileUploadRepository } from "#repositories/file.upload.repository.js";

const MAX_POST_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

@injectable()
export class FileService {
  constructor(
    @inject(S3Service) private readonly s3Service: S3Service,
    @inject(FileUploadRepository)
    private readonly fileRepository: FileUploadRepository,
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

  async saveFileMetadata(
    metadata: z.infer<typeof fileMetadataDTOSchema>,
    key: string,
    hash: string,
  ): Promise<void> {
    const validData = fileMetadataDTOSchema.parse(metadata);

    await this.fileRepository.create({
      ...validData,
      key,
      hash,
    });
  }
}
