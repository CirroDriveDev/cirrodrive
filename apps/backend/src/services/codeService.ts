import { injectable, inject } from "inversify";
import type { Code, Prisma } from "@cirrodrive/database";
import type { Logger } from "pino";
import { Symbols } from "@/types/symbols.ts";
import { generateCode } from "@/utils/generateCode.ts";

/**
 * 코드 서비스입니다.
 */
@injectable()
export class CodeService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.CodeModel) private codeModel: Prisma.CodeDelegate,
  ) {
    this.logger = logger.child({ serviceName: "CodeService" });
  }

  /**
   * 새로운 코드를 생성합니다.
   *
   * @param fileId - 파일 ID입니다.
   * @returns 생성된 코드입니다.
   * @throws 코드 생성 중 오류가 발생한 경우.
   */
  public async createCode(fileId: number): Promise<Code> {
    try {
      this.logger.info(
        {
          methodName: "createCode",
          fileId,
        },
        "코드 생성 시작",
      );

      const codeString = generateCode(8);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const code = await this.codeModel.create({
        data: {
          codeString,
          fileId,
          expiresAt,
        },
      });

      return code;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 코드를 삭제합니다.
   *
   * @param codeString - 삭제할 코드 문자열입니다.
   * @throws 코드 삭제 중 오류가 발생한 경우.
   */
  public async deleteCode(codeString: string): Promise<void> {
    try {
      this.logger.info(
        {
          methodName: "deleteCode",
          codeString,
        },
        "코드 삭제 시작",
      );

      await this.codeModel.delete({
        where: { codeString },
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes("Record to delete does not exist.")
      ) {
        throw new Error("해당 코드가 존재하지 않습니다.");
      }
      if (error instanceof Error) {
        this.logger.error(
          { methodName: "deleteCode", codeString, error: error.message },
          "코드 삭제 중 오류 발생",
        );
      }
      throw error;
    }
  }

  /**
   * 코드로 파일 메타데이터를 조회합니다.
   *
   * @param codeString - 조회할 코드 문자열입니다.
   * @returns 파일 메타데이터입니다.
   * @throws 코드 조회 중 오류가 발생한 경우.
   */
  public async getCodeMetadata(codeString: string): Promise<{
    fileId: number;
    fileName: string;
    fileSize: number;
    fileExtension: string;
  }> {
    try {
      this.logger.info(
        {
          methodName: "getCodeMetadata",
          codeString,
        },
        "코드 메타데이터 조회 시작",
      );

      const code = await this.codeModel.findUnique({
        where: { codeString },
        include: { file: true },
      });

      if (!code) {
        throw new Error("유효하지 않은 코드입니다.");
      }

      return {
        fileId: code.file.id,
        fileName: code.file.name,
        fileSize: code.file.size,
        fileExtension: code.file.extension,
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }
  public async getCodes(userId: number): Promise<Code[]> {
    try {
      this.logger.info(
        { methodName: "getCodes", userId },
        "사용자 코드 목록 조회 시작",
      );

      const codes = await this.codeModel.findMany({
        where: {
          userId, // 사용자의 ID를 조건으로 코드 목록을 조회
        },
        include: {
          file: true, // 코드에 연결된 파일 정보도 함께 포함
        },
      });

      return codes;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }
}
