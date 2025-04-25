import { injectable, inject } from "inversify";
import type { File } from "@cirrodrive/database";
import type { Logger } from "pino";
import { Symbols } from "@/types/symbols.ts";
import { S3Service } from "@/services/s3.service.ts";
import { Transactional } from "@/decorators/transactional.ts";
import { FileRepository } from "@/repositories/file.repository.ts";
import { FileDomainService } from "@/services/file-domain.service";

@injectable()
export class FileService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(S3Service) private s3Service: S3Service,
    @inject(FileRepository)
    private fileRepository: FileRepository,
    @inject(FileDomainService)
    private fileDomainService: FileDomainService,
  ) {
    this.logger = logger.child({ serviceName: "FileService" });
  }

  // 생성

  /**
   * 파일을 생성합니다.
   *
   * @param name - 파일 이름입니다.
   * @param parentId - 부모 디렉터리 ID입니다.
   * @param ownerId - 소유자 ID입니다.
   * @param mimeType - MIME 타입입니다.
   * @param size - 파일 크기입니다.
   * @param hash - 파일 해시입니다.
   * @param s3Key - S3 키입니다.
   */
  @Transactional()
  public async createFile({
    name,
    parentId,
    ownerId,
    mimeType,
    size,
    hash,
    s3Key,
  }: {
    name: string;
    parentId: string;
    ownerId: string;
    mimeType: string;
    size: number;
    hash: string;
    s3Key: string;
  }): Promise<File> {
    const parent = await this.fileRepository.get(parentId);

    if (!parent) {
      throw new Error(`Parent directory not found. ID: ${parentId}`);
    }

    if (!parent.isDir) {
      throw new Error(`Parent ID is not a directory. ID: ${parentId}`);
    }

    const sanitizedName = await this.fileDomainService.ensureSafeFileName({
      fileName: name,
      parentId,
    });

    const file = await this.fileRepository.create({
      name: sanitizedName,
      isDir: false,
      parentId,
      ownerId,
      status: "ACTIVE",
      mimeType,
      size,
      hash,
      s3Key,
      fullPath: `${parent.fullPath}/${sanitizedName}`,
    });

    this.logger.info(`File '${name}' created successfully.`);

    return file;
  }

  /**
   * 디렉터리를 생성합니다.
   *
   * @param name - 디렉터리 이름입니다.
   * @param parentId - 부모 디렉터리 ID입니다.
   * @param ownerId - 소유자 ID입니다.
   */
  @Transactional()
  public async createDirectory({
    name,
    parentId,
    ownerId,
  }: {
    name: string;
    parentId: string;
    ownerId: string;
  }): Promise<void> {
    const parent = await this.fileRepository.get(parentId);
    if (!parent?.isDir) {
      throw new Error("Invalid parent directory.");
    }

    const sanitizedName = await this.fileDomainService.ensureSafeFileName({
      fileName: name,
      parentId,
    });

    await this.fileRepository.create({
      name: sanitizedName,
      isDir: true,
      parentId,
      ownerId,
      status: "ACTIVE",
      fullPath: `${parent.fullPath}/${sanitizedName}`,
    });

    this.logger.info(`Directory '${name}' created successfully.`);
  }

  // 조회

  /**
   * 코드로 파일 메타데이터를 조회합니다.
   *
   * @param code - 조회할 코드 문자열입니다.
   * @returns 파일 메타데이터입니다.
   */
  @Transactional()
  async findFileByCode({ code }: { code: string }): Promise<File> {
    const metadata = await this.fileRepository.getByCode(code);

    if (!metadata) {
      throw new Error(`No metadata found for code ${code}`);
    }

    return metadata;
  }

  /**
   * 디렉터리의 내용을 나열합니다.
   *
   * @param id - 디렉터리의 ID입니다.
   * @returns 디렉터리 내용 목록입니다.
   */
  @Transactional()
  public async listContents({ id }: { id: string }): Promise<File[]> {
    const contents = await this.fileRepository.listByParentId(id);

    this.logger.info(`Listed contents of '${id}'.`);
    return contents;
  }

  /**
   * 사용자의 휴지통 엔트리 목록을 조회합니다.
   *
   * @param userId - 사용자 ID입니다.
   * @returns 휴지통 엔트리 목록입니다.
   */
  @Transactional()
  public async listTrashEntries({
    userId,
  }: {
    userId: string;
  }): Promise<File[]> {
    const entries = await this.fileRepository.listByOwnerId(userId, {
      status: "TRASHED",
    });

    this.logger.info(`Listed trash entries for user '${userId}'.`);

    return entries;
  }

  /**
   * 사용자의 파일 목록을 조회합니다.
   *
   * @param userId - 사용자 ID입니다.
   * @returns 파일 목록입니다.
   */
  @Transactional()
  public async listFileByUserId({
    userId,
  }: {
    userId: string;
  }): Promise<File[]> {
    const files = await this.fileRepository.listByOwnerId(userId, {
      status: "ACTIVE",
    });

    this.logger.info(`Listed files for user '${userId}'.`);

    return files;
  }

  /**
   * 특정 ID의 폴더를 조회합니다.
   *
   * @param folderId - 조회할 폴더의 ID입니다.
   * @returns 폴더 엔트리입니다.
   */
  @Transactional()
  public async getFolderById(folderId: string): Promise<File | null> {
    const folder = await this.fileRepository.get(folderId);

    if (folder?.isDir) {
      return folder;
    }

    return null;
  }

  /**
   * 특정 폴더의 하위 엔트리들을 조회합니다.
   *
   * @param folderId - 조회할 폴더의 ID입니다.
   * @returns 하위 엔트리 목록입니다.
   */
  @Transactional()
  public async listSubEntries({
    folderId,
  }: {
    folderId: string;
  }): Promise<File[]> {
    const folder = await this.getFolderById(folderId);
    if (!folder) {
      throw new Error(`Folder not found. ID: ${folderId}`);
    }

    const entries = await this.fileRepository.listByFullPath(folder.fullPath, {
      status: "ACTIVE",
    });

    this.logger.info(`Listed sub-entries of '${folderId}'.`);

    return entries;
  }

  // 수정

  /**
   * 파일 엔트리의 이름을 변경합니다.
   *
   * @param id - 대상 파일 엔트리의 ID입니다.
   * @param newName - 새 이름입니다.
   */
  @Transactional()
  public async rename({
    id,
    newName,
  }: {
    id: string;
    newName: string;
  }): Promise<void> {
    const entry = await this.fileRepository.get(id);
    if (!entry) {
      throw new Error("File or directory not found.");
    }

    await this.fileRepository.update(id, { name: newName });

    this.logger.info(`Renamed '${id}' to '${newName}'.`);
  }

  /**
   * 파일 엔트리를 이동합니다.
   *
   * @param sourceId - 원본 파일 엔트리의 ID입니다.
   * @param targetId - 대상 디렉터리의 ID입니다.
   */
  @Transactional()
  public async move({
    sourceId,
    targetId,
  }: {
    sourceId: string;
    targetId: string;
  }): Promise<void> {
    const target = await this.fileRepository.get(targetId);
    if (!target?.isDir) {
      throw new Error("Target ID is not a valid directory.");
    }

    const source = await this.fileRepository.get(sourceId);
    if (!source) {
      throw new Error("Source file or directory not found.");
    }

    if (source.parentId === targetId) {
      throw new Error("Source and target are the same.");
    }

    const sanitizedName = await this.fileDomainService.ensureSafeFileName({
      fileName: source.name,
      parentId: targetId,
    });

    await this.fileRepository.update(sourceId, {
      name: sanitizedName,
      parentId: targetId,
    });

    this.logger.info(`Moved '${sourceId}' to '${targetId}'.`);
  }

  /**
   * 파일 엔트리를 복사합니다.
   *
   * @param sourceId - 원본 파일 엔트리의 ID입니다.
   * @param targetId - 대상 디렉터리의 ID입니다.
   */
  @Transactional()
  public async copy({
    sourceId,
    targetId,
  }: {
    sourceId: string;
    targetId: string;
  }): Promise<void> {
    const source = await this.fileRepository.get(sourceId);
    if (!source) {
      throw new Error("Source file or directory not found.");
    }

    const target = await this.fileRepository.get(targetId);
    if (!target?.isDir) {
      throw new Error("Target ID is not a valid directory.");
    }

    if (source.isDir) {
      // 디렉터리 복사
      await this.copyDirectoryRecursive({
        source,
        targetId,
      });
    } else {
      // 파일 복사
      const sanitizedName = await this.fileDomainService.ensureSafeFileName({
        fileName: source.name,
        parentId: targetId,
      });

      await this.fileRepository.create({
        name: sanitizedName,
        isDir: false,
        parentId: targetId,
        ownerId: source.ownerId,
        status: source.status,
        size: source.size,
        mimeType: source.mimeType,
        hash: source.hash,
        s3Key: source.s3Key,
        fullPath: `${target.fullPath}/${sanitizedName}`,
      });
    }

    this.logger.info(`Copied '${sourceId}' to '${targetId}'.`);
  }

  /**
   * 디렉터리를 재귀적으로 복사합니다.
   *
   * @param source - 원본 디렉터리 엔트리입니다.
   * @param targetParentId - 대상 부모 디렉터리의 ID입니다.
   */
  private async copyDirectoryRecursive({
    source,
    targetId,
  }: {
    source: File;
    targetId: string;
  }): Promise<void> {
    const target = await this.fileRepository.get(targetId);

    if (!target) {
      throw new Error("Target directory not found.");
    }

    if (!target.isDir) {
      throw new Error("Target ID is not a valid directory.");
    }

    const sanitizedName = await this.fileDomainService.ensureSafeFileName({
      fileName: source.name,
      parentId: targetId,
    });

    const newDirectory = await this.fileRepository.create({
      name: source.name,
      isDir: true,
      parentId: targetId,
      ownerId: source.ownerId,
      status: source.status,
      fullPath: `${target.fullPath}/${sanitizedName}`,
    });

    const children = await this.fileRepository.listByParentId(source.id);

    for (const child of children) {
      if (child.isDir) {
        // 하위 디렉터리 복사
        await this.copyDirectoryRecursive({
          source: child,
          targetId: newDirectory.id,
        });
      } else {
        // 하위 파일 복사
        const sanitizedFileName =
          await this.fileDomainService.ensureSafeFileName({
            fileName: child.name,
            parentId: targetId,
          });

        await this.fileRepository.create({
          name: sanitizedFileName,
          isDir: false,
          parentId: newDirectory.id,
          ownerId: child.ownerId,
          status: child.status,
          size: child.size,
          mimeType: child.mimeType,
          hash: child.hash,
          fullPath: `${target.fullPath}/${sanitizedFileName}`,
        });
      }
    }
  }

  // 삭제

  /**
   * 파일 엔트리를 휴지통으로 이동합니다.
   *
   * @param id - 휴지통으로 이동할 파일 엔트리의 ID입니다.
   */
  @Transactional()
  public async trash({ id }: { id: string }): Promise<void> {
    await this.fileRepository.update(id, {
      status: "TRASHED",
      trashedAt: new Date(),
    });

    this.logger.info(`Trashed '${id}'.`);
  }

  /**
   * 파일 엔트리를 보관 상태로 변경합니다.
   *
   * @param id - 보관할 파일 엔트리의 ID입니다.
   */
  @Transactional()
  public async archive({ id }: { id: string }): Promise<void> {
    await this.fileRepository.update(id, {
      status: "ARCHIVED",
      archivedAt: new Date(),
    });

    this.logger.info(`Archived '${id}'.`);
  }

  /**
   * 파일 엔트리를 완전 삭제합니다.
   *
   * @param id - 완전 삭제할 파일 엔트리의 ID입니다.
   */
  @Transactional()
  public async hardDelete({ id }: { id: string }): Promise<void> {
    const entry = await this.fileRepository.get(id);
    if (!entry) {
      throw new Error("File or directory not found.");
    }

    if (!entry.isDir && entry.s3Key) {
      await this.s3Service.deleteObject(entry.s3Key);
    }

    await this.fileRepository.delete(id);

    this.logger.info(`Hard deleted '${id}'.`);
  }
}
