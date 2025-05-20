import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import type {
  FileAccessCode,
  FileMetadata,
  Prisma,
} from "@cirrodrive/database/prisma";
import { Symbols } from "#types/symbols.js";
import { FileAccessCodeRepository } from "#repositories/file-access-code.repository.js";
import { generateCode } from "#utils/generate-code.js";

export interface FileAccessCodeServiceInterface {
  // create
  /**
   * 새로운 코드를 생성합니다.
   *
   * @param fileId - 파일 ID입니다. 정수형 값이어야 하며, 데이터베이스에 존재하는 파일의 ID여야 합니다.
   * @param expiresAt - 만료 날짜입니다. ISO 8601 형식의 Date 객체로 전달되어야 하며, 선택적으로 제공할 수
   *   있습니다.
   * @returns 생성된 코드입니다.
   */
  create: ({
    fileId,
    expiresAt,
  }: {
    fileId: string;
    expiresAt: Date;
  }) => Promise<FileAccessCode>;

  // read

  /**
   * 파일 ID로 코드를 조회합니다.
   *
   * @param fileId - 파일 ID입니다.
   * @returns 조회된 코드입니다.
   */
  getByFileId: (params: { fileId: string }) => Promise<FileAccessCode>;

  /**
   * 사용자 ID로 코드 목록을 조회합니다.
   *
   * @param userId - 사용자 ID입니다.
   * @returns 코드 목록입니다.
   */
  listByFileOwnerId: (params: { userId: string }) => Promise<FileAccessCode[]>;

  // update

  // delete
  /**
   * 코드를 삭제합니다.
   *
   * @param codeString - 삭제할 코드 문자열입니다.
   */
  deleteByCode: (params: { code: string }) => Promise<void>;

  getCodeMetadata: (params: { code: string }) => Promise<FileMetadata>;
}

@injectable()
export class FileAccessCodeService implements FileAccessCodeServiceInterface {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(FileAccessCodeRepository)
    private fileAccessCodeRepository: FileAccessCodeRepository,
    @inject(Symbols.FileMetadataModel)
    private fileMetadataModel: Prisma.FileMetadataDelegate,
  ) {
    this.logger = logger.child({ serviceName: "FileAccessCodeService" });
  }

  // create
  async create({
    fileId,
    expiresAt,
  }: {
    fileId: string;
    expiresAt?: Date;
  }): Promise<FileAccessCode> {
    const file = await this.fileMetadataModel.findUnique({
      where: { id: fileId },
    });
    if (!file) {
      throw new Error(`File entry not found for fileId ${fileId}`);
    }

    const code = generateCode();
    const newCode = await this.fileAccessCodeRepository.create({
      code,
      expiresAt: expiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000), // 임시로 24시간 후 만료로 설정
      fileId,
    });
    this.logger.info(`Created access code for fileId ${fileId}`);
    return newCode;
  }

  // read
  async getByFileId({ fileId }: { fileId: string }): Promise<FileAccessCode> {
    const code = await this.fileAccessCodeRepository.getByFileId(fileId);
    if (!code) {
      throw new Error(`No access code found for fileId ${fileId}`);
    }
    return code;
  }

  async getCodeMetadata({ code }: { code: string }): Promise<FileMetadata> {
    const fileAccessCode = await this.fileAccessCodeRepository.getByCode(code);
    if (!fileAccessCode) {
      throw new Error(`No access code found for code ${code}`);
    }

    const fileMetadata = await this.fileMetadataModel.findUnique({
      where: { id: fileAccessCode.fileId },
    });
    if (!fileMetadata) {
      throw new Error(
        `No file metadata found for fileId ${fileAccessCode.fileId}`,
      );
    }

    return fileMetadata;
  }

  async listByFileOwnerId({
    userId,
  }: {
    userId: string;
  }): Promise<FileAccessCode[]> {
    return this.fileAccessCodeRepository.listByFileOwnerId(userId);
  }

  // update

  // delete
  async deleteByCode({ code }: { code: string }): Promise<void> {
    await this.fileAccessCodeRepository.deleteByCode(code);
    this.logger.info(`Deleted access code ${code}`);
  }
}
