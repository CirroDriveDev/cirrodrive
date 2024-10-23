import { injectable, inject } from "inversify";
import type { Prisma, User } from "@prisma/client";
import { hash } from "@node-rs/argon2";
import type { Logger } from "pino";
import {
  CreateUserRequestBody,
  CreateUserResponseBody,
  GetUserResponseBody,
  GetUsersResponseBody,
  UpdateUserRequestBody,
  UpdateUserResponseBody,
} from "@cirrodrive/types";
import { Symbols } from "@/types/symbols.ts";

/**
 * 사용자 서비스입니다.
 */
@injectable()
export class UserService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.UserModel) private userModel: Prisma.UserDelegate,
  ) {
    this.logger = logger.child({ serviceName: "UserService" });
  }

  /**
   * 새로운 사용자를 생성합니다.
   * @param userData - 사용자 생성을 위한 입력 데이터입니다.
   * @returns 생성된 사용자입니다.
   * @throws 사용자 생성 중 오류가 발생한 경우.
   */
  public async createUser(
    userData: CreateUserRequestBody,
  ): Promise<CreateUserResponseBody> {
    try {
      this.logger.info(
        {
          methodName: "createUser",
          username: userData.username,
          email: userData.email,
        },
        "회원가입 요청 시작",
      );

      // 존재하는 사용자인지 확인
      const existingUser = await this.userModel.findUnique({
        where: { username: userData.username },
      });

      if (existingUser) {
        throw new Error("이미 존재하는 사용자입니다.");
      }

      // 존재하는 이메일인지 확인
      const existingEmail = await this.userModel.findUnique({
        where: { email: userData.email },
      });

      if (existingEmail) {
        throw new Error("이미 존재하는 이메일입니다.");
      }

      const hashedPassword = await hash(userData.password);

      const user = await this.userModel.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });

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
  public async getUsers(
    limit: number,
    offset: number,
  ): Promise<GetUsersResponseBody> {
    try {
      this.logger.info("사용자 목록 조회 중");

      const users: GetUsersResponseBody = await this.userModel.findMany({
        take: limit,
        skip: offset,
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
  public async getUser(username: string): Promise<GetUserResponseBody> {
    try {
      this.logger.info("사용자 이름으로 사용자 조회 중");

      const user = await this.userModel.findUnique({
        where: { username },
      });

      if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

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
   * @param userData - 수정할 사용자 데이터입니다.
   * @returns 수정된 사용자 또는 찾을 수 없는 경우 null입니다.
   * @throws 사용자 수정 중 오류가 발생한 경우.
   */
  public async updateUser(
    username: string,
    userData: UpdateUserRequestBody,
  ): Promise<UpdateUserResponseBody> {
    try {
      this.logger.info("사용자 이름으로 사용자 수정 중");

      // 존재하는 사용자인지 확인
      const existingUser = await this.userModel.findUnique({
        where: { username },
      });

      if (!existingUser) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      const hashedPassword = await hash(userData.password);

      const user = await this.userModel.update({
        data: {
          ...userData,
          password: hashedPassword,
        },
        where: { username },
      });

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
  public async deleteUser(username: string): Promise<User> {
    try {
      this.logger.info("사용자 이름으로 사용자 삭제 중");

      // 존재하는 사용자인지 확인
      const existingUser = await this.userModel.findUnique({
        where: { username },
      });

      if (!existingUser) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      const user = await this.userModel.delete({ where: { username } });

      return user;
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      throw e;
    }
  }
}
