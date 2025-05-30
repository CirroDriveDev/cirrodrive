import path from "node:path";
import { inject, injectable } from "inversify";
import { S3Service } from "#services/s3.service";
import { FileMetadataRepository } from "#repositories/file-metadata.repository";
import { FileService } from "#services/file.service";
import { FileAccessCodeService } from "#services/file-access-code.service";

@injectable()
export class FileUploadService {
  constructor(
    @inject(S3Service) private readonly s3Service: S3Service,
    @inject(FileMetadataRepository)
    private readonly fileRepository: FileMetadataRepository,
    @inject(FileService)
    private readonly fileService: FileService,
    @inject(FileAccessCodeService)
    private readonly fileAccessCodeService: FileAccessCodeService, // 추가
  ) {}

  async completeUpload({
    name,
    key,
    parentFolderId,
    userId,
  }: {
    name: string;
    key: string;
    userId?: string;
    parentFolderId?: string;
  }) {
    const headObjectData = await this.s3Service.headObject(key);
    let ownerId;

    if (userId) {
      if (userId === headObjectData.Metadata.userId) {
        ownerId = userId;
      } else {
        throw new Error("File owner does not match the provided ownerId.");
      }
    }

    const extension = path.extname(name);

    const file = await this.fileService.save({
      name,
      size: headObjectData.ContentLength,
      extension,
      key,
      hash: "",
      parentFolderId,
      ownerId,
    });

    return {
      file,
    };
  }
}
