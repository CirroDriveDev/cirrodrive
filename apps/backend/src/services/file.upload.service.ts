// src/services/file.upload.service.ts
import path from "node:path";
import { inject, injectable } from "inversify";
import { S3Service } from "#services/s3.service";
import { FileMetadataRepository } from "#repositories/file-metadata.repository";
import { FileService } from "#services/file.service";

@injectable()
export class FileUploadService {
  constructor(
    @inject(S3Service) private readonly s3Service: S3Service,
    @inject(FileMetadataRepository)
    private readonly fileRepository: FileMetadataRepository,
    @inject(FileService)
    private readonly fileService: FileService,
  ) {}

  async completeUpload({
    name,
    key,
    parentFolderId,
    ownerId,
  }: {
    ownerId: string;
    name: string;
    key: string;
    parentFolderId?: string;
  }) {
    // S3에서 오브젝트 메타데이터 조회 및 해시 계산 등은 서비스에서 처리
    let headObjectData;
    try {
      headObjectData = await this.s3Service.headObject(key);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Not Found")) {
          throw new Error("File not found in S3.");
        }
        throw new Error(`Failed to retrieve object metadata: ${error.message}`);
      }
      throw error;
    }

    const metadata = headObjectData.Metadata;
    const { userId } = metadata;

    if (userId !== ownerId) {
      throw new Error("File owner does not match the provided ownerId.");
    }

    const extension = path.extname(name);
    return await this.fileService.save({
      name,
      size: headObjectData.ContentLength,
      extension,
      key,
      hash: "",
      parentFolderId,
      ownerId,
    });
  }
}
