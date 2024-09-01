import { injectable, inject } from "inversify";
import type { Prisma } from "@prisma/client";
import { Argon2id } from "oslo/password";
import type { Logger } from "pino";
import { UserInput, UserOutput } from "@/types/dto.ts";
import { Symbols } from "@/types/symbols.ts";
import { userSelect } from "@/config/userSelect.ts";
import { UserValidationService } from "@/services/userValidationService.ts";

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

      const user = await this.userModel.create({
        select: userSelect,
        data: {
          ...userInput,
          password: hashedPassword,
        },
      });

      return user;
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      throw e;
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
      this.logger.info("사용자 조회 중");

      const users: UserOutput[] = await this.userModel.findMany({
        select: userSelect,
        take: limit,
        skip: offset,
      });

      return users;
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      throw e;
    }
  }

  /**
   * ID로 사용자를 조회합니다.
   * @param id - 조회할 사용자의 ID입니다.
   * @returns 지정된 ID를 가진 사용자 또는 찾을 수 없는 경우 null입니다.
   * @throws 사용자 조회 중 오류가 발생한 경우.
   */
  public async getUserById(id: number): Promise<UserOutput | null> {
    try {
      this.logger.info("ID로 사용자 조회 중");

      const user = await this.userModel.findUnique({
        select: userSelect,
        where: { id },
      });

      return user;
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      throw e;
    }
  }

  /**
   * ID로 사용자를 수정합니다.
   * @param id - 수정할 사용자의 ID입니다.
   * @param userInput - 수정할 사용자 데이터입니다.
   * @returns 수정된 사용자 또는 찾을 수 없는 경우 null입니다.
   * @throws 사용자 수정 중 오류가 발생한 경우.
   */
  public async updateUser(
    id: number,
    userInput: UserInput,
  ): Promise<UserOutput | null> {
    try {
      this.logger.info("ID로 사용자 수정 중");
      let hashedPassword: string | undefined;

      if (userInput.username) {
        if (!this.userValidationService.validateUsername(userInput.username)) {
          throw new Error("사용자 이름 유효성 검사 실패");
        }
      }

      if (userInput.email) {
        if (!this.userValidationService.validateEmail(userInput.email)) {
          throw new Error("이메일 유효성 검사 실패");
        }
      }

      if (userInput.password) {
        if (!this.userValidationService.validatePassword(userInput.password)) {
          throw new Error("비밀번호 유효성 검사 실패");
        }
        hashedPassword = await argon2id.hash(userInput.password);
      }

      if (userInput.nickname) {
        if (!this.userValidationService.validateNickname(userInput.nickname)) {
          throw new Error("닉네임 유효성 검사 실패");
        }
      }

      const user = await this.userModel.update({
        select: userSelect,
        data: {
          ...userInput,
          password: hashedPassword,
        },
        where: { id },
      });

      return user;
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      throw e;
    }
  }

  /**
   * ID로 사용자를 삭제합니다.
   * @param id - 삭제할 사용자의 ID입니다.
   * @returns 삭제된 사용자 또는 찾을 수 없는 경우 null입니다.
   * @throws 사용자 삭제 중 오류가 발생한 경우.
   */
  public async deleteUser(id: number): Promise<UserOutput | null> {
    try {
      this.logger.info("ID로 사용자 삭제 중");

      const user = await this.userModel.delete({
        select: userSelect,
        where: { id },
      });

      return user;
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      throw e;
    }
  }
}
