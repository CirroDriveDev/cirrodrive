import fs from "node:fs";
import path from "node:path";
import { injectable, inject } from "inversify";
import type { Prisma, FileMetadata } from "@cirrodrive/database";
import type { Logger } from "pino";
import { PrismaClient } from "@cirrodrive/database";
import { Symbols } from "@/types/symbols.ts";
import { CodeService } from "@/services/codeService.ts";
/**
 * 파일 서비스입니다.
 */
@injectable()
export class FileService {
  private rootDir: string;
  private prisma: PrismaClient;

  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.FileMetadataModel)
    private fileMetadataModel: Prisma.FileMetadataDelegate,
    @inject(CodeService) private codeService: CodeService,
  ) {
    this.prisma = new PrismaClient();
    this.rootDir = `./`;
    this.logger = logger.child({ serviceName: "FileService" });
  }

  /**
   * 파일을 디스크에 저장하고 메타데이터를 데이터베이스에 저장합니다.
   *
   * @param file - 저장할 파일입니다.
   * @param ownerId - 사용자의 ID입니다.
   * @returns 저장된 파일의 경로와 이름입니다.
   * @throws 파일 저장 중 오류가 발생한 경우.
   */
  public async saveFile(file: File, ownerId?: number): Promise<FileMetadata> {
    try {
      this.logger.info(
        {
          methodName: "saveFile",
          fileName: file.name,
        },
        "파일 저장 시작",
      );

      const { path: filePath } = await this.writeFileToDisk(file);

      // 파일 메타데이터를 데이터베이스에 저장
      const fileMetadata = await this.fileMetadataModel.create({
        data: {
          ownerId,
          name: file.name,
          extension: path.extname(file.name),
          size: file.size,
          hash: "",
          savedPath: filePath,
        },
      });

      this.logger.info(
        {
          methodName: "saveFile",
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
   * @returns 다운로드할 파일입니다.
   * @throws 파일 조회 중 오류가 발생한 경우.
   */
  public async getFileById(fileId: number): Promise<File> {
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

      const filePath = fileMetadata.savedPath;

      if (!fs.existsSync(filePath)) {
        throw new Error(
          `파일 경로 ${filePath}에 해당하는 파일을 찾을 수 없습니다.`,
        );
      }

      const fileBuffer = fs.readFileSync(filePath);
      const file = new File([fileBuffer], fileMetadata.name);

      this.logger.info(
        {
          methodName: "getFileById",
          fileId,
        },
        "파일 조회 완료",
      );

      return file;
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
  public async listFileMetadataByParentFolder(
    parentFolderId: number,
  ): Promise<FileMetadata[]> {
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
   * 코드로 파일 다운로드
   *
   * @param codeString - 다운로드할 파일의 코드입니다.
   * @returns 다운로드할 파일입니다.
   * @throws 파일 조회 중 오류가 발생한 경우.
   */
  public async getFileByCode(codeString: string): Promise<File> {
    try {
      this.logger.info(
        {
          methodName: "getFileByCode",
          codeString,
        },
        "코드로 파일 조회 시작",
      );

      const { id } = await this.codeService.getCodeMetadata(codeString);

      const file = await this.getFileById(id);

      this.logger.info(
        {
          methodName: "getFileByCode",
          codeString,
        },
        "코드로 파일 조회 완료",
      );

      return file;
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
  public async fileExists(fileId: number): Promise<boolean> {
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

      const filePath = fileMetadata.savedPath;

      if (!fs.existsSync(filePath)) {
        throw new Error(
          `파일 경로 ${filePath}에 해당하는 파일을 찾을 수 없습니다.`,
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
  public async sameNameExists(
    name: string,
    parentFolderId: number,
  ): Promise<boolean> {
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

  public async moveFile(
    fileId: number,
    targetFolderId: number,
  ): Promise<FileMetadata> {
    try {
      this.logger.info(
        { methodName: "moveFile", fileId, targetFolderId },
        "파일 이동 시작",
      );

      // 파일 메타데이터 업데이트
      const updatedMetadata = await this.fileMetadataModel.update({
        where: { id: fileId },
        data: {
          parentFolder: {
            connect: {
              id: targetFolderId,
            },
          },
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
   * 파일을 디스크에 저장합니다.
   *
   * @param file - 저장할 파일입니다.
   * @returns 저장된 파일의 경로와 이름입니다.
   */
  private async writeFileToDisk(
    file: File,
  ): Promise<{ path: string; name: string }> {
    const uploadDate = Date.now();
    const fileDir = path.resolve(`${this.rootDir}/data`);

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    const savedName = `${uploadDate}-${file.name}`;
    const filePath = path.resolve(`${fileDir}/${savedName}`);
    this.logger.info(
      { methodName: "writeFileToDisk", fileName: file.name, filePath },
      "파일 저장 시작",
    );

    const fileBuffer = await file
      .arrayBuffer()
      .then((buffer) => Buffer.from(buffer));
    fs.writeFileSync(filePath, fileBuffer.toString("base64"), "base64");

    this.logger.info(
      { methodName: "writeFileToDisk", fileName: file.name, filePath },
      "파일 저장 완료",
    );

    return { path: filePath, name: savedName };
  }
  public async getFileMetadata(fileId: number): Promise<FileMetadata | null> {
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
   * @returns 업데이트된 파일 메타데이터입니다.
   * @throws 파일 이동 중 오류가 발생한 경우.
   */
  public async moveToTrash(fileId: number): Promise<FileMetadata> {
    try {
      this.logger.info(
        { methodName: "moveToTrash", fileId },
        "파일 휴지통 이동 시작",
      );

      // 파일 메타데이터 업데이트
      const updatedMetadata = await this.fileMetadataModel.update({
        where: { id: fileId },
        data: {
          trashedAt: new Date(), // 'trashedAt' 필드를 현재 시간으로 업데이트
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
  async deleteFile(fileId: number): Promise<void> {
    const file = await this.prisma.fileMetadata.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("파일이 존재하지 않습니다.");
    }

    // 파일 삭제
    if (file.savedPath) {
      fs.unlinkSync(file.savedPath); // 로컬 스토리지에서 파일 삭제
    }

    // 데이터베이스에서 파일 메타데이터 삭제
    await this.prisma.fileMetadata.delete({
      where: { id: fileId },
    });

    this.logger.info({ fileId }, "파일이 영구적으로 삭제되었습니다.");
  }

  async updateFileName(fileId: number, newName: string): Promise<FileMetadata> {
    // 파일 이름만 변경 (폴더 변경 필요 없음)
    return await this.prisma.fileMetadata.update({
      where: { id: fileId },
      data: { name: newName },
    });
  }
  public async restoreFromTrash(fileId: number): Promise<void> {
    try {
      this.logger.info(
        { methodName: "restoreFromTrash", fileId },
        "파일 복원 시작",
      );

      // 파일 메타데이터 업데이트
      await this.fileMetadataModel.update({
        where: { id: fileId },
        data: {
          trashedAt: null, // 'trashedAt' 필드를 null로 업데이트하여 복원
        },
      });

      this.logger.info(
        { methodName: "restoreFromTrash", fileId },
        "파일 복원 완료",
      );
    } catch (error) {
      this.logger.error(
        { methodName: "restoreFromTrash", error },
        "파일 복원 중 오류 발생",
      );
      throw new Error("파일 복원 중 오류가 발생했습니다.");
    }
  }
  public async moveFolderToTrash(folderId: number): Promise<void> {
    try {
      this.logger.info(
        { methodName: "moveFolderToTrash", folderId },
        "폴더 휴지통 이동 시작",
      );

      // 폴더를 휴지통으로 이동
      await this.fileMetadataModel.updateMany({
        where: { parentFolderId: folderId },
        data: { trashedAt: new Date() }, // 폴더에 포함된 모든 파일을 휴지통으로 이동
      });

      // 폴더 자체를 휴지통으로 이동
      await this.fileMetadataModel.update({
        where: { id: folderId },
        data: { trashedAt: new Date() },
      });

      this.logger.info(
        { methodName: "moveFolderToTrash", folderId },
        "폴더 및 해당 파일들의 휴지통 이동 완료",
      );
    } catch (error) {
      this.logger.error(
        { methodName: "moveFolderToTrash", error },
        "폴더 휴지통 이동 중 오류 발생",
      );
      throw new Error("폴더를 휴지통으로 이동하는 중 오류가 발생했습니다.");
    }
  }

  public async restoreFolderFromTrash(folderId: number): Promise<void> {
    try {
      this.logger.info(
        { methodName: "restoreFolderFromTrash", folderId },
        "폴더 복원 시작",
      );

      // 폴더 복원
      await this.fileMetadataModel.updateMany({
        where: { parentFolderId: folderId },
        data: { trashedAt: null }, // 폴더에 포함된 파일들을 복원
      });

      // 폴더 자체 복원
      await this.fileMetadataModel.update({
        where: { id: folderId },
        data: { trashedAt: null },
      });

      this.logger.info(
        { methodName: "restoreFolderFromTrash", folderId },
        "폴더 및 해당 파일들의 복원 완료",
      );
    } catch (error) {
      this.logger.error(
        { methodName: "restoreFolderFromTrash", error },
        "폴더 복원 중 오류 발생",
      );
      throw new Error("폴더를 복원하는 중 오류가 발생했습니다.");
    }
  }

  public async deleteFolder(folderId: number): Promise<void> {
    try {
      this.logger.info(
        { methodName: "deleteFolder", folderId },
        "폴더 삭제 시작",
      );

      // 폴더에 포함된 모든 파일들을 삭제
      const files = await this.fileMetadataModel.findMany({
        where: { parentFolderId: folderId },
      });

      for (const file of files) {
        await this.deleteFile(file.id); // FileService에서 삭제
      }

      // 폴더 삭제
      await this.fileMetadataModel.deleteMany({
        where: { parentFolderId: folderId },
      });

      this.logger.info(
        { methodName: "deleteFolder", folderId },
        "폴더 및 해당 파일들 삭제 완료",
      );
    } catch (error) {
      this.logger.error(
        { methodName: "deleteFolder", error },
        "폴더 삭제 중 오류 발생",
      );
      throw new Error("폴더 삭제 중 오류가 발생했습니다.");
    }
  }
}
