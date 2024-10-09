import { injectable, inject } from "inversify";
import type { Prisma } from "@prisma/client";
import { Argon2id } from "oslo/password";
import type { Logger } from "pino";
import { UserInput, UserOutput, UserOutputSchema } from "@cirrodrive/types";
import { UserValidationService } from "@/services/userValidationService.ts";
import { Symbols } from "@/types/symbols.ts";

const argon2id = new Argon2id();

/**
 * 사용자 서비스입니다.
 */
@injectable()
export class UserService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.UserModel) private userModel: Prisma.UserDelegate,
    @inject(UserValidationService)
    private userValidationService: UserValidationService,
  ) {
    this.logger = logger.child({ prefix: "UserService" });
  }

  /**
   * 새로운 사용자를 생성합니다.
   * @param userInput - 사용자 생성을 위한 입력 데이터입니다.
   * @returns 생성된 사용자입니다.
   * @throws 사용자 생성 중 오류가 발생한 경우.
   */
  public async createUser(userInput: UserInput): Promise<UserOutput> {
    try {
      this.logger.info("사용자 생성 중");

      if (!this.userValidationService.validateUserInput(userInput)) {
        throw new Error("사용자 데이터 유효성 검사 실패");
      }

      const hashedPassword = await argon2id.hash(userInput.password);

      const result = await this.userModel.create({
        data: {
          ...userInput,
          password: hashedPassword,
        },
      });

      const user = UserOutputSchema.parse(result);

      return user;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 사용자 목록을 조회합니다.
   * @param limit - 조회할 사용자의 최대 개수입니다.
   * @param offset - 건너뛸 사용자의 개수입니다.
   * @returns 사용자 목록입니다.
   * @throws 사용자 조회 중 오류가 발생한 경우.
   */
  public async getUsers(limit: number, offset: number): Promise<UserOutput[]> {
    try {
      this.logger.info("사용자 목록 조회 중");

      const result: UserOutput[] = await this.userModel.findMany({
        take: limit,
        skip: offset,
      });

      const users = result.map((user) => {
        return UserOutputSchema.parse(user);
      });

      return users;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 사용자 이름으로 사용자를 조회합니다.
   * @param username - 조회할 사용자의 이름입니다.
   * @returns 지정된 ID를 가진 사용자 또는 찾을 수 없는 경우 null입니다.
   * @throws 사용자 조회 중 오류가 발생한 경우.
   */
  public async getUser(username: string): Promise<UserOutput | null> {
    try {
      this.logger.info("사용자 이름으로 사용자 조회 중");

      const result = await this.userModel.findUnique({
        where: { username },
      });

      if (!result) {
        return null;
      }

      const user = UserOutputSchema.parse(result);

      return user;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 사용자 이름으로 사용자를 수정합니다.
   * @param username - 수정할 사용자의 이름입니다.
   * @param userInput - 수정할 사용자 데이터입니다.
   * @returns 수정된 사용자 또는 찾을 수 없는 경우 null입니다.
   * @throws 사용자 수정 중 오류가 발생한 경우.
   */
  public async updateUser(
    username: string,
    userInput: UserInput,
  ): Promise<UserOutput> {
    try {
      this.logger.info("사용자 이름으로 사용자 수정 중");

      if (!this.userValidationService.validateUsername(userInput.username)) {
        throw new Error("사용자 이름 유효성 검사 실패");
      }

      if (!this.userValidationService.validatePassword(userInput.password)) {
        throw new Error("비밀번호 유효성 검사 실패");
      }

      if (!this.userValidationService.validateEmail(userInput.email)) {
        throw new Error("이메일 유효성 검사 실패");
      }

      const hashedPassword = await argon2id.hash(userInput.password);

      const result = await this.userModel.update({
        data: {
          ...userInput,
          password: hashedPassword,
        },
        where: { username },
      });

      const user = UserOutputSchema.parse(result);

      return user;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 사용자 이름으로 사용자를 삭제합니다.
   * @param username - 삭제할 사용자의 이름입니다.
   * @returns 삭제된 사용자 또는 찾을 수 없는 경우 null입니다.
   * @throws 사용자 삭제 중 오류가 발생한 경우.
   */
  public async deleteUser(username: string): Promise<UserOutput | null> {
    try {
      this.logger.info("사용자 이름으로 사용자 삭제 중");

      const result = await this.userModel.delete({
        where: { username },
      });

      const user = UserOutputSchema.parse(result);

      return user;
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      throw e;
    }
  }
}
