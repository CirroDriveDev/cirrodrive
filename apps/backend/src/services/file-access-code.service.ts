import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import type {
  FileAccessCode,
  FileMetadata,
  Prisma,
} from "@cirrodrive/database/prisma";
import { Symbols } from "#types/symbols";
import { FileAccessCodeRepository } from "#repositories/file-access-code.repository";
import { generateCode } from "#utils/generate-code";

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
  /**
   * 다운로드 코드를 생성합니다. 코드가 중복될 경우 최대 5회까지 재시도합니다. 암호학적으로 안전하고 URL-safe한 코드가 생성됩니다.
   *
   * @throws Error - 5회 시도 후에도 충돌 시 에러 발생
   */
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

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode();
      try {
        const newCode = await this.fileAccessCodeRepository.create({
          code,
          expiresAt: expiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000),
          fileId,
        });
        this.logger.info(`Created access code for fileId ${fileId}`);
        return newCode;
      } catch (err: unknown) {
        // Prisma unique constraint violation (중복 코드)
        if (
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          (err as { code?: string }).code === "P2002" &&
          "meta" in err &&
          Array.isArray(
            (err as { meta?: { target?: string[] } }).meta?.target,
          ) &&
          (err as { meta?: { target?: string[] } }).meta!.target!.includes(
            "code",
          )
        ) {
          this.logger.warn(
            `Code collision detected, retrying... (attempt ${attempt + 1})`,
          );
          continue;
        }
        throw err;
      }
    }
    this.logger.error(`Failed to generate unique access code after 5 attempts`);
    throw new Error("Failed to generate unique access code after 5 attempts");
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
