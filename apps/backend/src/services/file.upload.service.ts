// src/services/file.upload.service.ts
import { inject, injectable } from "inversify";
import { s3PresignedPostSchema } from "@cirrodrive/schemas/s3";
import { S3Service, S3_KEY_PREFIX } from "#services/s3.service.js";
import { FileMetadataRepository } from "#repositories/file-metadata.repository.js";

const MAX_POST_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

@injectable()
export class FileUploadService {
  constructor(
    @inject(S3Service) private readonly s3Service: S3Service,
    @inject(FileMetadataRepository)
    private readonly fileRepository: FileMetadataRepository,
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
    metadata: {
      name: string;
      size: number;
      extension: string;
      parentFolderId: string | null;
      hash: string;
    },
    key: string,
  ): Promise<void> {
    await this.fileRepository.create({
      name: metadata.name,
      size: metadata.size,
      extension: metadata.extension,
      hash: metadata.hash,
      trashedAt: null,
      parentFolderId: metadata.parentFolderId,
      ownerId: null,
      key, // 실제 S3 key 저장
    });
  }

  async completeUpload({
    key,
    parentFolderId,
  }: {
    key: string;
    parentFolderId?: string;
  }) {
    // S3에서 오브젝트 메타데이터 조회 및 해시 계산 등은 서비스에서 처리
    const s3Meta = await this.s3Service.headObject(key);
    await this.saveFileMetadata(
      {
        name: s3Meta.name,
        size: s3Meta.size,
        hash: s3Meta.hash,
        extension: s3Meta.extension,
        parentFolderId: parentFolderId ?? null,
      },
      key,
    );
  }
}
