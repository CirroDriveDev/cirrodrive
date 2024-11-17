import { injectable, inject } from "inversify";
import type { Code, Prisma } from "@cirrodrive/database";
import type { Logger } from "pino";
import { Symbols } from "@/types/symbols.ts";

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
   * 사용자가 생성한 코드 목록을 가져옵니다.
   *
   * @param userId - 사용자의 ID
   * @returns 사용자 코드 목록
   */
  public async getCodes(userId: number): Promise<Code[]> {
    try {
      this.logger.info(
        { methodName: "getCodes", userId },
        "사용자 코드 목록 조회 시작",
      );

      const codes = await this.codeModel.findMany({
        where: {
          userId, // Code 테이블에서 userId를 조건으로 사용
        },
        include: {
          file: true, // 관련된 file 정보도 함께 포함
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
}
