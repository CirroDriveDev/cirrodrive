import path from "node:path";
import { injectable, inject } from "inversify";
import type { Prisma, FileMetadata } from "@cirrodrive/database/prisma";
import type { Logger } from "pino";
import { Symbols } from "#types/symbols.js";
import { FileAccessCodeService } from "#services/file-access-code.service.js";
import { UserService } from "#services/user.service.js";
import { type S3Metadata } from "#services/s3.service.js";
/**
 * 파일 서비스입니다.
 */
@injectable()
export class FileService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.FileMetadataModel)
    private fileMetadataModel: Prisma.FileMetadataDelegate,
    @inject(FileAccessCodeService) private codeService: FileAccessCodeService,
    @inject(UserService) private userService: UserService,
  ) {
    this.logger = logger.child({ serviceName: "FileService" });
  }

  /**
   * 메타데이터를 데이터베이스에 저장합니다.
   *
   * @param metadata - S3 메타데이터입니다.
   * @param ownerId - 사용자의 ID입니다.
   * @returns 저장된 파일의 경로와 이름입니다.
   * @throws 파일 저장 중 오류가 발생한 경우.
   */
  public async save({
    metadata,
    parentFolderId,
    ownerId,
  }: {
    metadata: S3Metadata;
    parentFolderId?: string;
    ownerId?: string;
  }): Promise<FileMetadata> {
    try {
      this.logger.info(
        {
          methodName: "save",
          metadata,
        },
        "파일 저장 시작",
      );

      // 파일 메타데이터를 데이터베이스에 저장
      const fileMetadata = await this.fileMetadataModel.create({
        data: {
          ownerId,
          name: metadata.name,
          extension: metadata.extension,
          size: metadata.size,
          key: metadata.key,
          hash: metadata.hash,
          parentFolderId,
        },
      });

      this.logger.info(
        {
          methodName: "save",
          fileMetadataId: fileMetadata.id,
        },
        "파일 메타데이터 저장 완료",
      );

      return fileMetadata;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * ID로 파일 메타데이터 조회
   *
   * @param fileId - 다운로드할 파일의 ID입니다.
   * @returns 파일 메타데이터입니다.
   * @throws 파일 조회 중 오류가 발생한 경우.
   */
  public async getFileById({
    fileId,
  }: {
    fileId: string;
  }): Promise<FileMetadata> {
    try {
      this.logger.info(
        {
          methodName: "getFileById",
          fileId,
        },
        "파일 조회 시작",
      );

      const fileMetadata = await this.fileMetadataModel.findUnique({
        where: { id: fileId },
      });

      if (!fileMetadata) {
        throw new Error(
          `파일 ID ${fileId}에 해당하는 파일을 찾을 수 없습니다.`,
        );
      }

      this.logger.info(
        {
          methodName: "getFileById",
          fileId,
        },
        "파일 조회 완료",
      );

      return fileMetadata;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 부모 폴더 ID로 파일 메타데이터 목록 조회
   *
   * @param parentFolderId - 부모 폴더의 ID입니다.
   * @returns 파일 메타데이터 목록입니다.
   * @throws 파일 조회 중 오류가 발생한 경우.
   */
  public async listFileMetadataByParentFolder({
    parentFolderId,
  }: {
    parentFolderId: string;
  }): Promise<FileMetadata[]> {
    try {
      this.logger.info(
        {
          methodName: "listFileMetadataByParentFolder",
          parentFolderId,
        },
        "파일 목록 조회 시작",
      );

      const files = await this.fileMetadataModel.findMany({
        where: {
          parentFolderId,
        },
      });

      this.logger.info(
        {
          methodName: "listFileMetadataByParentFolder",
          parentFolderId,
          files,
        },
        "파일 목록 조회 완료",
      );

      return files;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 사용자의 휴지통 파일 목록을 조회합니다.
   *
   * @param ownerId - 휴지통 파일을 조회할 회원의 ID입니다.
   * @returns 휴지통 파일 목록입니다.
   * @throws 휴지통 파일 조회 중 오류가 발생한 경우.
   */
  public async listTrashByUser({
    ownerId,
  }: {
    ownerId: string;
  }): Promise<FileMetadata[]> {
    try {
      this.logger.info(
        {
          methodName: "listTrashByUser",
          ownerId,
        },
        "휴지통 파일 목록 조회 시작",
      );

      const files = await this.fileMetadataModel.findMany({
        where: {
          ownerId,
          trashedAt: {
            not: null,
          },
        },
      });

      this.logger.info(
        {
          methodName: "listTrashByUser",
          ownerId,
          files,
        },
        "휴지통 파일 목록 조회 완료",
      );

      return files;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 코드로 파일 다운로드
   *
   * @param codeString - 다운로드할 파일의 코드입니다.
   * @returns 파일 메타데이터입니다.
   * @throws 파일 조회 중 오류가 발생한 경우.
   */
  public async getFileByCode({
    codeString,
  }: {
    codeString: string;
  }): Promise<FileMetadata> {
    try {
      this.logger.info(
        {
          methodName: "getFileByCode",
          codeString,
        },
        "코드로 파일 조회 시작",
      );

      const { id } = await this.codeService.getCodeMetadata({
        code: codeString,
      });

      const metadata = await this.getFileById({ fileId: id });

      this.logger.info(
        {
          methodName: "getFileByCode",
          codeString,
        },
        "코드로 파일 조회 완료",
      );

      return metadata;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 파일이 존재하는지 확인합니다.
   *
   * @param fileId - 확인할 파일의 ID입니다.
   * @returns 파일이 존재하는지 여부입니다.
   * @throws 파일 조회 중 오류가 발생한 경우.
   */
  public async fileExists({ fileId }: { fileId: string }): Promise<boolean> {
    try {
      this.logger.info(
        {
          methodName: "fileExists",
          fileId,
        },
        "파일 존재 여부 확인 시작",
      );

      const fileMetadata = await this.fileMetadataModel.findUnique({
        where: { id: fileId },
      });

      if (!fileMetadata) {
        throw new Error(
          `파일 ID ${fileId}에 해당하는 파일을 찾을 수 없습니다.`,
        );
      }

      this.logger.info(
        {
          methodName: "fileExists",
          fileId,
        },
        "파일 존재 여부 확인 완료",
      );

      return true;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      return false;
    }
  }

  /**
   * 동일한 이름의 파일이 존재하는지 확인합니다.
   *
   * @param name - 확인할 파일 이름입니다.
   * @param parentFolderId - 부모 폴더의 ID입니다.
   * @returns 동일한 이름의 파일 존재 여부입니다.
   */
  public async existsByName({
    name,
    parentFolderId,
  }: {
    name: string;
    parentFolderId: string;
  }): Promise<boolean> {
    try {
      this.logger.info(
        {
          methodName: "sameNameExists",
          name,
          parentFolderId,
        },
        "동일한 이름의 파일 존재 여부 확인 시작",
      );

      const fileMetadata = await this.fileMetadataModel.findFirst({
        where: {
          name,
          parentFolderId,
        },
      });

      this.logger.info(
        {
          methodName: "sameNameExists",
          name,
          parentFolderId,
        },
        "동일한 이름의 파일 존재 여부 확인 완료",
      );

      return Boolean(fileMetadata);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      return false;
    }
  }

  public async moveFile({
    fileId,
    targetFolderId,
  }: {
    fileId: string;
    targetFolderId: string;
  }): Promise<FileMetadata> {
    try {
      this.logger.info(
        { methodName: "moveFile", fileId, targetFolderId },
        "파일 이동 시작",
      );

      // 이동하려는 파일의 메타데이터 조회
      const file = await this.fileMetadataModel.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        throw new Error("파일을 찾을 수 없습니다.");
      }

      // 대상 폴더에서 동일한 이름과 확장자를 가진 파일이 있는지 확인
      const existingFile = await this.fileMetadataModel.findFirst({
        where: {
          parentFolderId: targetFolderId,
          name: file.name,
          extension: file.extension,
        },
      });

      let newFileName = file.name;
      if (existingFile) {
        newFileName = await this.generateFileName({
          parentFolderId: targetFolderId,
          name: file.name,
        });
      }

      // 파일 메타데이터 업데이트
      const updatedMetadata = await this.fileMetadataModel.update({
        where: { id: fileId },
        data: {
          parentFolder: {
            connect: {
              id: targetFolderId,
            },
          },
          name: newFileName,
        },
      });

      this.logger.info(
        {
          methodName: "moveFile",
          updatedMetadata,
        },
        "파일 이동 완료",
      );

      return updatedMetadata;
    } catch (error) {
      this.logger.error(
        { methodName: "moveFile", error },
        "파일 이동 중 오류 발생",
      );
      throw new Error("파일 이동 중 오류가 발생했습니다.");
    }
  }

  /**
   * 파일을 복사합니다.
   *
   * @param fileId - 복사할 파일의 ID입니다.
   * @param targetFolderId - 복사할 대상 폴더의 ID입니다.
   * @returns 복사된 파일 메타데이터입니다.
   * @throws 파일 복사 중 오류가 발생한 경우.
   */
  public async copy({
    fileId,
    targetFolderId,
  }: {
    fileId: string;
    targetFolderId: string;
  }): Promise<FileMetadata> {
    try {
      this.logger.info(
        { methodName: "copy", fileId, targetFolderId },
        "파일 복사 시작",
      );

      // 파일 메타데이터 조회
      const fileMetadata = await this.fileMetadataModel.findUnique({
        where: { id: fileId },
      });

      if (!fileMetadata) {
        throw new Error("파일 메타데이터를 찾을 수 없습니다.");
      }

      // 파일 이름 생성
      const copiedName = await this.generateFileName({
        parentFolderId: targetFolderId,
        name: fileMetadata.name,
      });

      // 파일 메타데이터 복사
      const copiedMetadata = await this.fileMetadataModel.create({
        data: {
          name: copiedName,
          extension: fileMetadata.extension,
          size: fileMetadata.size,
          hash: fileMetadata.hash,
          key: fileMetadata.key,
          parentFolder: {
            connect: {
              id: targetFolderId,
            },
          },
        },
      });

      this.logger.info(
        {
          methodName: "copy",
          copiedMetadata,
        },
        "파일 복사 완료",
      );

      return copiedMetadata;
    } catch (error) {
      this.logger.error(
        { methodName: "copy", error },
        "파일 복사 중 오류 발생",
      );
      throw new Error("파일 복사 중 오류가 발생했습니다.");
    }
  }

  public async getFileMetadata({
    fileId,
  }: {
    fileId: string;
  }): Promise<FileMetadata | null> {
    try {
      const fileMetadata = await this.fileMetadataModel.findUnique({
        where: {
          id: fileId,
        },
      });
      return fileMetadata;
    } catch (error) {
      // error가 Error 객체인지 확인한 후 message를 사용
      if (error instanceof Error) {
        this.logger.error(error.message, "파일 메타데이터 조회 오류");
      } else {
        this.logger.error("알 수 없는 오류 발생", "파일 메타데이터 조회 오류");
      }
      return null;
    }
  }

  /**
   * 파일을 휴지통으로 이동합니다.
   *
   * @param fileId - 휴지통으로 이동할 파일의 ID입니다.
   * @param userid - 파일 소유자의 ID입니다.
   * @returns 업데이트된 파일 메타데이터입니다.
   * @throws 파일 이동 중 오류가 발생한 경우.
   */
  public async moveToTrash({
    fileId,
    userId,
  }: {
    fileId: string;
    userId: string;
  }): Promise<FileMetadata> {
    try {
      this.logger.info(
        { methodName: "moveToTrash", fileId },
        "파일 휴지통 이동 시작",
      );

      const user = await this.userService.get({ id: userId });

      if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      const file = await this.fileMetadataModel.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        throw new Error("파일을 찾을 수 없습니다.");
      }

      // 파일 메타데이터 업데이트
      const updatedMetadata = await this.fileMetadataModel.update({
        where: { id: fileId },
        data: {
          trashedAt: new Date(), // 'trashedAt' 필드를 현재 시간으로 업데이트
          parentFolderId: user.trashFolderId,
          restoreFolderId: file.parentFolderId,
        },
      });

      this.logger.info(
        {
          methodName: "moveToTrash",
          updatedMetadata,
        },
        "파일 휴지통 이동 완료",
      );

      return updatedMetadata;
    } catch (error) {
      this.logger.error(
        { methodName: "moveToTrash", error },
        "파일 휴지통 이동 중 오류 발생",
      );
      throw new Error("파일을 휴지통으로 이동하는 중 오류가 발생했습니다.");
    }
  }
  async deleteFile({ fileId }: { fileId: string }): Promise<void> {
    const file = await this.fileMetadataModel.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("파일이 존재하지 않습니다.");
    }

    // 데이터베이스에서 파일 메타데이터 삭제
    await this.fileMetadataModel.delete({
      where: { id: fileId },
    });

    this.logger.info({ fileId }, "파일이 영구적으로 삭제되었습니다.");
  }

  async rename({
    fileId,
    name,
  }: {
    fileId: string;
    name: string;
  }): Promise<FileMetadata> {
    const file = await this.fileMetadataModel.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("파일을 찾을 수 없습니다.");
    }

    if (file.parentFolderId === null) {
      throw new Error("파일의 부모 폴더가 존재하지 않습니다.");
    }

    if (file.trashedAt !== null) {
      throw new Error("휴지통에 있는 파일의 이름은 변경할 수 없습니다.");
    }

    const newName = await this.generateFileName({
      parentFolderId: file.parentFolderId,
      name,
    });

    // 파일 이름 변경
    const newFile = await this.fileMetadataModel.update({
      where: { id: fileId },
      data: { name: newName },
    });

    return newFile;
  }

  /**
   * 적절한 파일 이름을 생성합니다.
   *
   * @param parentFolderId - 부모 폴더의 ID입니다.
   * @param name - 원본 파일 이름입니다.
   * @returns 생성된 파일 이름입니다
   */
  public async generateFileName({
    parentFolderId,
    name,
  }: {
    parentFolderId: string;
    name: string;
  }): Promise<string> {
    this.logger.info(
      { methodName: "generateFileName", parentFolderId, name },
      "파일 이름 생성 시작",
    );

    if (!(await this.existsByName({ name, parentFolderId }))) {
      this.logger.info(
        { methodName: "generateFileName", name },
        "파일 이름 생성 완료",
      );
      return name;
    }

    const baseName = path.win32.basename(name, path.extname(name));
    const extension = path.extname(name);
    const regexpResult = /^(?<originalName>.*?)(?: \((?<count>\d+)\))?$/.exec(
      baseName,
    );

    if (!regexpResult) {
      throw new Error("파일 이름을 분석할 수 없습니다.");
    }

    let originalName = regexpResult.groups?.originalName ?? baseName;
    let count = 1;

    if (regexpResult.groups?.count) {
      originalName = baseName;
      count = parseInt(regexpResult.groups.count);
    }

    let fileName = `${originalName} (${count})${extension}`;

    while (await this.existsByName({ name: fileName, parentFolderId })) {
      fileName = `${originalName} (${count})${extension}`;
      count += 1;
    }

    this.logger.info(
      { methodName: "generateFileName", fileName },
      "파일 이름 생성 완료",
    );

    return fileName;
  }

  public async restoreFromTrash({ fileId }: { fileId: string }): Promise<void> {
    try {
      this.logger.info(
        { methodName: "restoreFromTrash", fileId },
        "파일 복원 시작",
      );

      const file = await this.fileMetadataModel.findUnique({
        where: { id: fileId },
      });

      if (!file) {
        throw new Error("파일을 찾을 수 없습니다.");
      }

      if (file.restoreFolderId === null) {
        throw new Error("파일의 복원 폴더가 존재하지 않습니다.");
      }

      const newName = await this.generateFileName({
        parentFolderId: file.restoreFolderId,
        name: file.name,
      });

      // 파일 메타데이터 업데이트
      await this.fileMetadataModel.update({
        where: { id: fileId },
        data: {
          name: newName,
          trashedAt: null, // 'trashedAt' 필드를 null로 업데이트하여 복원
          parentFolderId: file.restoreFolderId,
        },
      });

      this.logger.info(
        { methodName: "restoreFromTrash", fileId },
        "파일 복원 완료",
      );
    } catch (error) {
      this.logger.error(
        { methodName: "restoreFromTrash", error },
        "파일 복원 ��� 오류 발생",
      );
      throw new Error("파일 복원 중 오류가 발생했습니다.");
    }
  }
}
