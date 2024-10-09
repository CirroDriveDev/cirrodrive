import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import { isEmail, isAlphanumeric, isLength } from "validator";
import { UserInput, UserInputSchema } from "@cirrodrive/types";
import { Symbols } from "@/types/symbols.ts";

/**
 * 사용자 데이터 유효성 검사 서비스입니다.
 */
@injectable()
export class UserValidationService {
  constructor(@inject(Symbols.Logger) private logger: Logger) {
    this.logger = logger.child({ prefix: "UserValidationService" });
  }

  /**
   * 사용자 데이터를 검증합니다.
   * @param userInput - 검증할 사용자 데이터
   * @returns 사용자 데이터가 유효하면 true, 그렇지 않으면 false
   */
  public validateUserInput(userInput: UserInput): boolean {
    this.logger.info("사용자 데이터 유효성 검사를 시작합니다");

    const { success, data } = UserInputSchema.safeParse(userInput);

    const result =
      success &&
      this.validateUsername(data.username) &&
      this.validatePassword(data.password) &&
      this.validateEmail(data.email);

    this.logger.info(
      `사용자 데이터 유효성 검사 결과: ${result ? "성공" : "실패"}`,
    );

    return result;
  }

  /**
   * 사용자 이름을 검증합니다.
   * 3자 이상 64자 이하의 알파벳, 숫자, 하이픈, 밑줄, 마침표만 허용합니다.
   * @param username - 검증할 사용자 이름
   * @returns 사용자 이름이 유효하면 true, 그렇지 않으면 false
   */
  public validateUsername(username: string): boolean {
    this.logger.info("사용자 이름 검증을 시작합니다");

    const result =
      isLength(username, { min: 3, max: 64 }) &&
      isAlphanumeric(username, "en-US", { ignore: "-_." });

    this.logger.info(`사용자 이름 검증 결과: ${result ? "성공" : "실패"}`);

    return result;
  }

  /**
   * 비밀번호를 검증합니다.
   * 8자 이상 64자 이하의 비밀번호만 허용합니다.
   * @param password - 검증할 비밀번호
   * @returns 비밀번호가 유효하면 true, 그렇지 않으면 false
   */
  public validatePassword(password: string): boolean {
    this.logger.info("사용자 비밀번호 검증을 시작합니다");

    const result = isLength(password, { min: 8, max: 64 });

    this.logger.info(`사용자 비밀번호 검증 결과: ${result ? "성공" : "실패"}`);

    return result;
  }

  /**
   * 이메일을 검증합니다.
   * @param email - 검증할 이메일
   * @returns 이메일이 유효하면 true, 그렇지 않으면 false
   */
  public validateEmail(email: string): boolean {
    this.logger.info("사용자 이메일 검증을 시작합니다");

    const result = isEmail(email);

    this.logger.info(`사용자 이메일 검증 결과: ${result ? "성공" : "실패"}`);

    return result;
  }
}
