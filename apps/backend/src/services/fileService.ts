import fs from "node:fs";
import path from "node:path";
import { injectable, inject } from "inversify";
import type { Prisma, FileMetadata } from "@cirrodrive/database";
import type { Logger } from "pino";
import { Symbols } from "@/types/symbols.ts";
import { CodeService } from "@/services/codeService.ts";

/**
 * 파일 서비스입니다.
 */
@injectable()
export class FileService {
  private rootDir: string;

  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.FileMetadataModel)
    private fileMetadataModel: Prisma.FileMetadataDelegate,
    @inject(CodeService) private codeService: CodeService,
  ) {
    this.rootDir = `./`;
    this.logger = logger.child({ serviceName: "FileService" });
  }

  /**
   * 파일을 디스크에 저장하고 메타데이터를 데이터베이스에 저장합니다.
   *
   * @param file - 저장할 파일입니다.
   * @param userId - 사용자의 ID입니다.
   * @param folderId - 선택적인 폴더 ID
   * @returns 저장된 파일의 경로와 이름입니다.
   * @throws 파일 저장 중 오류가 발생한 경우.
   */
  public async saveFile(file: File, userId?: number): Promise<FileMetadata> {
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
          owner: userId,
          folderId: 0,
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

      const { fileId } = await this.codeService.getCodeMetadata(codeString);

      const file = await this.getFileById(fileId);

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
   * 파일을 디스크에 저장합니다.
   *
   * @param file - 저장할 파일입니다.
   * @returns 저장된 파일의 경로와 이름입니다.
   * @throws 파일 저장 중 오류가 발생한 경우.
   */
  private async writeFileToDisk(
    file: File,
  ): Promise<{ path: string; name: string }> {
    const uploadDate = Date.now();
    const fileDir = path.resolve(`${this.rootDir}/data`);

    // 파일 저장 디렉토리가 없으면 생성
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    const savedName = `${uploadDate}-${file.name}`;
    const filePath = path.resolve(`${fileDir}/${savedName}`);
    this.logger.info(
      {
        methodName: "writeFileToDisk",
        fileName: file.name,
        filePath,
      },
      "파일 저장 시작",
    );

    const fileBuffer = await file
      .arrayBuffer()
      .then((buffer) => Buffer.from(buffer));
    fs.writeFileSync(filePath, fileBuffer.toString("base64"), "base64");

    this.logger.info(
      {
        methodName: "writeFileToDisk",
        fileName: file.name,
        filePath,
      },
      "파일 저장 완료",
    );

    return {
      path: filePath,
      name: savedName,
    };
  }
  private async writeFileToUserDisk(
    file: File,
    userDir: string, // 사용자 디렉토리
  ): Promise<{ path: string; name: string }> {
    const uploadDate = Date.now();
    const savedName = `${uploadDate}-${file.name}`;
    const filePath = path.resolve(`${userDir}/${savedName}`);

    this.logger.info(
      { methodName: "writeFileToUserDisk", fileName: file.name, filePath },
      "회원 파일 저장 시작",
    );

    const fileBuffer = await file
      .arrayBuffer()
      .then((buffer) => Buffer.from(buffer));
    fs.writeFileSync(filePath, fileBuffer.toString("base64"), "base64");

    this.logger.info(
      { methodName: "writeFileToUserDisk", fileName: file.name, filePath },
      "회원 파일 저장 완료",
    );

    return {
      path: filePath,
      name: savedName,
    };
  }

  public async saveFileToUserDrive(
    userId: number,
    file: File,
    folderId?: number, // 선택적 폴더 ID
  ): Promise<FileMetadata> {
    try {
      this.logger.info(
        { methodName: "saveFileToUserDrive", userId, fileName: file.name },
        "회원 파일 저장 시작",
      );

      // 사용자의 디렉토리 경로 설정
      const userDir = path.resolve(`${this.rootDir}/data/users/${userId}`);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // 파일을 해당 사용자 디렉토리에 저장
      const { path: filePath } = await this.writeFileToUserDisk(file, userDir);

      // 파일 메타데이터를 데이터베이스에 저장
      const fileMetadata = await this.fileMetadataModel.create({
        data: {
          owner: userId,
          folderId: folderId ?? 0, // 폴더 ID가 제공되지 않으면 기본값 0
          name: file.name,
          extension: path.extname(file.name),
          size: file.size,
          hash: "", // 해시를 계산할 수 있으면 계산하여 저장
          savedPath: filePath,
        },
      });

      this.logger.info(
        { methodName: "saveFileToUserDrive", fileMetadataId: fileMetadata.id },
        "회원 파일 메타데이터 저장 완료",
      );

      return fileMetadata;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }
}
