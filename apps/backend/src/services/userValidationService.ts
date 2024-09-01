import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import isAlphanumeric from "validator/lib/isAlphanumeric";
import isEmail from "validator/lib/isEmail";
import isLength from "validator/lib/isLength";
import { UserInput } from "@/types/dto.ts";
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
    this.logger.info("validateUser 호출됨");
    return (
      this.validateUsername(userInput.username) &&
      this.validatePassword(userInput.password) &&
      this.validateEmail(userInput.email) &&
      this.validateNickname(userInput.nickname)
    );
  }

  /**
   * 사용자 이름을 검증합니다.
   * @param username - 검증할 사용자 이름
   * @returns 사용자 이름이 유효하면 true, 그렇지 않으면 false
   */
  public validateUsername(username: string): boolean {
    this.logger.info("validateUsername 호출됨");
    return (
      isLength(username, { min: 3, max: 64 }) &&
      isAlphanumeric(username, "en-US", { ignore: "-_." })
    );
  }

  /**
   * 비밀번호를 검증합니다.
   * @param password - 검증할 비밀번호
   * @returns 비밀번호가 유효하면 true, 그렇지 않으면 false
   */
  public validatePassword(password: string): boolean {
    this.logger.info("validatePassword 호출됨");
    return isLength(password, { min: 8, max: 64 });
  }

  /**
   * 이메일을 검증합니다.
   * @param email - 검증할 이메일
   * @returns 이메일이 유효하면 true, 그렇지 않으면 false
   */
  public validateEmail(email: string): boolean {
    this.logger.info("validateEmail 호출됨");
    return isEmail(email);
  }

  /**
   * 닉네임을 검증합니다.
   * @param nickname - 검증할 닉네임
   * @returns 닉네임이 유효하면 true, 그렇지 않으면 false
   */
  public validateNickname(nickname: string): boolean {
    this.logger.info("validateNickname 호출됨");
    return isLength(nickname, { min: 2, max: 64 });
  }
}
