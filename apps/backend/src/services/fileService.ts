import fs from "node:fs";
import path from "node:path";
import { injectable, inject } from "inversify";
import type { Prisma, FileMetadata } from "@cirrodrive/database";
import type { Logger } from "pino";
import { Symbols } from "@/types/symbols.ts";
import { CodeService } from "@/services/codeService.ts";
import { UserService } from "@/services/userService.ts";
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
    @inject(Symbols.UserService) private userService: UserService,
  ) {
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

  /**
   * 사용자가 소유한 파일을 다운로드합니다.
   *
   * @param userId - 다운로드 요청한 사용자 ID
   * @param fileId - 다운로드할 파일 ID
   * @returns 파일 데이터와 파일 이름
   * @throws 파일을 찾을 수 없거나 다운로드 중 오류 발생 시 예외
   */
  public async downloadFileForUser(
    userId: number,
    fileId: number,
  ): Promise<{ encodedFile: string; fileName: string }> {
    try {
      this.logger.info(
        { methodName: "downloadFileForUser", userId, fileId },
        "회원 파일 다운로드 시작",
      );

      // 1. 사용자 인증 확인 (UserService 사용)
      const user = await this.userService.get(userId);
      if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      // 2. 파일 조회 (해당 사용자에게 속하는지 확인)
      const fileMetadata = await this.fileMetadataModel.findUnique({
        where: { id: fileId },
        include: {
          owner: true, // 파일 소유자 정보 가져오기
        },
      });

      if (!fileMetadata || !fileMetadata.owner) {
        throw new Error("파일 소유자를 찾을 수 없습니다.");
      }

      // 3. 파일 소유자 확인
      if (fileMetadata.owner.id !== userId) {
        throw new Error("사용자에게 해당 파일이 없습니다.");
      }

      // 4. 파일 경로 확인 및 파일 읽기
      const filePath = fileMetadata.savedPath;
      if (!fs.existsSync(filePath)) {
        throw new Error("파일을 찾을 수 없습니다.");
      }

      // 5. 파일을 base64로 인코딩하여 반환
      const fileBuffer = fs.readFileSync(filePath);
      const fileString = Buffer.from(fileBuffer).toString("base64");

      this.logger.info(
        { methodName: "downloadFileForUser", userId, fileId },
        "회원 파일 다운로드 완료",
      );

      return {
        encodedFile: fileString,
        fileName: fileMetadata.name,
      };
    } catch (error) {
      this.logger.error(
        { methodName: "downloadFileForUser", error },
        "회원 파일 다운로드 중 오류 발생",
      );
      throw new Error("파일 다운로드 중 오류가 발생했습니다.");
    }
  }
  /**
   * 파일을 ID와 사용자 ID를 기준으로 조회합니다.
   *
   * @param fileId - 파일 ID
   * @param userId - 사용자 ID
   * @returns 조회된 파일 메타데이터
   */
  public async getFileByIdAndUser(
    fileId: number,
    userId: number,
  ): Promise<FileMetadata | null> {
    try {
      this.logger.info(
        { methodName: "getFileByIdAndUser", fileId, userId },
        "파일 조회 시작",
      );

      // 파일 메타데이터 조회
      const fileMetadata = await this.fileMetadataModel.findUnique({
        where: { id: fileId },
        include: {
          owner: true, // 파일 소유자 정보 포함
        },
      });

      // 파일이 존재하지 않거나, 해당 사용자가 파일 소유자가 아닐 경우
      if (
        !fileMetadata ||
        !fileMetadata.owner ||
        fileMetadata.owner.id !== userId
      ) {
        throw new Error(
          "해당 파일을 찾을 수 없거나, 사용자가 해당 파일을 소유하지 않습니다.",
        );
      }

      this.logger.info(
        { methodName: "getFileByIdAndUser", fileId, userId },
        "파일 조회 완료",
      );

      return fileMetadata;
    } catch (error) {
      this.logger.error(
        { methodName: "getFileByIdAndUser", error },
        "파일 조회 중 오류 발생",
      );
      throw new Error("파일 조회 중 오류가 발생했습니다.");
    }
  }
}
