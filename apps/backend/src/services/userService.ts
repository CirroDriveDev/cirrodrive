import { injectable, inject } from "inversify";
import type { Prisma, User } from "@cirrodrive/database";
import { hash } from "@node-rs/argon2";
import type { Logger } from "pino";
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
   *
   * @param username - 사용자 이름입니다.
   * @param password - 비밀번호입니다.
   * @param email - 이메일입니다.
   * @returns 생성된 사용자입니다.
   * @throws 사용자 생성 중 오류가 발생한 경우.
   */
  public async create(
    username: string,
    password: string,
    email: string,
  ): Promise<User> {
    try {
      this.logger.info(
        {
          methodName: "create",
          username,
          email,
        },
        "사용자 생성 시작",
      );

      const hashedPassword = await hash(password);

      const user = await this.userModel.create({
        data: {
          username,
          email,
          hashedPassword,
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
   *
   * @param limit - 조회할 사용자의 최대 개수입니다.
   * @param offset - 건너뛸 사용자의 개수입니다.
   * @returns 사용자 목록입니다.
   * @throws 사용자 조회 중 오류가 발생한 경우.
   */
  public async list(limit: number, offset: number): Promise<User[]> {
    try {
      this.logger.info(
        {
          methodName: "list",
          limit,
          offset,
        },
        "사용자 목록 조회 시작",
      );

      const users: User[] = await this.userModel.findMany({
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
   * 사용자를 조회합니다.
   *
   * @param id - 사용자 ID
   * @returns 지정된 ID를 가진 사용자 또는 null
   */
  public async get(id: number): Promise<User | null> {
    try {
      this.logger.info(
        {
          methodName: "get",
          id,
        },
        "사용자 조회 시작",
      );

      const user = await this.userModel.findUnique({
        where: { id },
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
   * 사용자를 조회합니다.
   *
   * @param username - 사용자 이름
   * @returns 지정된 이름을 가진 사용자 또는 null
   */
  public async getByUsername(username: string): Promise<User | null> {
    try {
      this.logger.info(
        {
          methodName: "getByUsername",
          username,
        },
        "사용자 조회 시작",
      );

      const user = await this.userModel.findUnique({
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
   * 사용자를 수정합니다.
   *
   * @param id - 사용자 ID
   * @param username - 사용자 이름
   * @param password - 비밀번호
   * @param email - 이메일
   * @returns 수정된 사용자
   */
  public async update(
    id: number,
    username: string,
    password: string,
    email: string,
  ): Promise<User> {
    try {
      this.logger.info(
        {
          methodName: "updateUser",
          id,
          username,
          password: "********",
          email,
        },
        "사용자 수정 시작",
      );

      const hashedPassword = await hash(password);

      const user = await this.userModel.update({
        data: {
          username,
          hashedPassword,
          email,
        },
        where: { id },
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
   * 사용자를 삭제합니다.
   *
   * @param id - 사용자 ID
   * @returns 삭제된 사용자
   */
  public async delete(id: number): Promise<User> {
    try {
      this.logger.info(
        {
          methodName: "delete",
          id,
        },
        "사용자 삭제 시작",
      );

      const user = await this.userModel.delete({
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
   * 사용자 이름이 이미 존재하는지 확인합니다.
   *
   * @param username - 사용자 이름
   * @returns 사용자 이름이 이미 존재하는지 여부
   */
  public async existsByUsername(username: string): Promise<boolean> {
    try {
      this.logger.info(
        {
          methodName: "existsByUsername",
          username,
        },
        "사용자 이름 중복 확인 시작",
      );

      const user = await this.userModel.findUnique({
        where: { username },
      });

      return user !== null;
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      throw e;
    }
  }

  /**
   * 이메일이 이미 존재하는지 확인합니다.
   *
   * @param email - 이메일
   * @returns 이메일이 이미 존재하는지 여부
   */
  public async existsByEmail(email: string): Promise<boolean> {
    try {
      this.logger.info(
        {
          methodName: "existsByEmail",
          email,
        },
        "이메일 중복 확인 시작",
      );

      const user = await this.userModel.findUnique({
        where: { email },
      });

      return user !== null;
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
      throw e;
    }
  }
}
