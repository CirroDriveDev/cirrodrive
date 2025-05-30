// src/services/file.upload.service.ts
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

  // 비회원 업로드용 메서드 추가
  async completeUploadAnonymous({
    name,
    key,
    parentFolderId,
  }: {
    name: string;
    key: string;
    parentFolderId?: string;
  }) {
    const ownerId = "anonymous";

    // S3 메타 데이터 조회 없이 바로 저장하려면 아래처럼 처리하거나, 필요 시 기존처럼 조회할 수 있음.
    // 필요하면 s3Service.headObject 호출 추가 가능

    const savedFile = await this.fileService.save({
      name,
      size: 0, // 크기 모를 경우 0 또는 별도 처리
      extension: path.extname(name),
      key,
      hash: "",
      parentFolderId,
      ownerId,
    });

    // 코드 생성
    const code = await this.fileAccessCodeService.create({
      fileId: savedFile.id,
    });

    return {
      file: savedFile,
      code,
    };
  }
}
