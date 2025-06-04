import { injectable, inject } from "inversify";
import type { Prisma, User } from "@cirrodrive/database/prisma";
import { hash, verify } from "@node-rs/argon2";
import { jwtVerify } from "jose";
import type { Logger } from "pino";
import { Symbols } from "#types/symbols";
import { createSecretKey } from "#utils/jwt";
import { PlanService } from "#services/plan.service";
import { UserRepository } from "#repositories/user.repository";

/**
 * 사용자 서비스입니다.
 */
@injectable()
export class UserService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.UserModel) private userModel: Prisma.UserDelegate,
    @inject(Symbols.FolderModel) private folderModel: Prisma.FolderDelegate,
    @inject(PlanService) private planService: PlanService,
    @inject(UserRepository) private userRepository: UserRepository,
  ) {
    this.logger = logger.child({ serviceName: "UserService" });
  }

  /**
   * 새로운 사용자를 생성합니다.
   *
   * @param username - 사용자 이름입니다.
   * @param password - 비밀번호입니다.
   * @param email - 이메일입니다.
   * @param token - 이메일 인증 토큰입니다.
   * @returns 생성된 사용자입니다.
   * @throws 사용자 생성 중 오류가 발생한 경우.
   */
  public async create({
    username,
    password,
    email,
    token, // 추가: 이메일 인증 토큰
  }: {
    username: string;
    password: string;
    email: string;
    token: string; // 추가
  }): Promise<User> {
    try {
      this.logger.info(
        {
          methodName: "create",
          username,
          email,
        },
        "사용자 생성 시작",
      );

      // JWT 검증
      const secretKey = createSecretKey();
      const { payload } = await jwtVerify(token, secretKey); // 수정: jwtVerify 사용
      if (payload.email !== email) {
        throw new Error("이메일 인증 토큰이 유효하지 않습니다.");
      }

      const hashedPassword = await hash(password);

      const plan = await this.planService.getDefaultPlan();

      const user = await this.userModel.create({
        data: {
          username,
          email,
          hashedPassword,
          rootFolder: {
            create: {
              name: "root",
            },
          },
          trashFolder: {
            create: {
              name: "trash",
            },
          },
          currentPlan: {
            connect: {
              id: plan.id,
            },
          },
        },
      });

      await this.folderModel.update({
        where: {
          id: user.rootFolderId,
        },
        data: {
          owner: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      await this.folderModel.update({
        where: {
          id: user.trashFolderId,
        },
        data: {
          owner: {
            connect: {
              id: user.id,
            },
          },
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
  public async list({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }): Promise<User[]> {
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
  public async get({ id }: { id: string }): Promise<User | null> {
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
  public async getByUsername({
    username,
  }: {
    username: string;
  }): Promise<User | null> {
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
   * 이메일로 사용자를 조회합니다.
   *
   * @param email - 이메일
   * @returns 지정된 이메일을 가진 사용자 또는 null
   */
  public async getByEmail({ email }: { email: string }): Promise<User | null> {
    try {
      this.logger.info({ methodName: "getByEmail", email }, "사용자 조회 시작");
      const user = await this.userModel.findUnique({
        where: { email },
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
   * @param data - 수정할 사용자 데이터
   * @param data.username - 사용자 이름
   * @param data.password - 비밀번호
   * @param data.email - 이메일
   * @returns 수정된 사용자
   */
  public async update(
    id: string,
    data: {
      username?: string;
      password?: string;
      email?: string;
    },
  ): Promise<User> {
    try {
      this.logger.info(
        {
          methodName: "updateUser",
          id,
        },
        "사용자 수정 시작",
      );

      const hashedPassword =
        data.password ? await hash(data.password) : undefined;

      const user = await this.userRepository.updateById(id, {
        ...data,
        hashedPassword,
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  public async updatePlan({
    userId,
    planId,
  }: {
    userId: string;
    planId: string;
  }): Promise<User> {
    this.logger.info(
      {
        methodName: "updatePlan",
        userId,
        planId,
      },
      "사용자 요금제 업데이트 시작",
    );
    const user = await this.userRepository.updateById(userId, {
      currentPlan: {
        connect: {
          id: planId,
        },
      },
    });
    this.logger.info(
      {
        methodName: "updatePlan",
        userId,
        planId,
      },
      "사용자 요금제 업데이트 완료",
    );
    return user;
  }

  public async updateTrialUsed({ userId }: { userId: string }): Promise<User> {
    this.logger.info(
      {
        methodName: "updateTrialUsed",
        userId,
      },
      "사용자 무료 체험 사용 여부 업데이트 시작",
    );
    const user = await this.userRepository.updateById(userId, {
      trialUsed: true,
    });
    this.logger.info(
      {
        methodName: "updateTrialUsed",
        userId,
      },
      "사용자 무료 체험 사용 여부 업데이트 완료",
    );
    return user;
  }

  /**
   * 사용자를 삭제합니다.
   *
   * @param id - 사용자 ID
   * @returns 삭제된 사용자
   */
  public async delete({ id }: { id: string }): Promise<User> {
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
  public async existsByUsername({
    username,
  }: {
    username: string;
  }): Promise<boolean> {
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
  public async existsByEmail({ email }: { email: string }): Promise<boolean> {
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
  /**
   * 이메일을 통해 사용자를 조회합니다.
   *
   * @param email - 이메일
   * @returns 사용자 또는 null
   */
  public async findByEmail({ email }: { email: string }): Promise<User | null> {
    try {
      this.logger.info(
        {
          methodName: "findByEmail",
          email,
        },
        "이메일로 사용자 조회 시작",
      );

      const user = await this.userModel.findUnique({
        where: { email },
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
   * 비밀번호를 재설정합니다.
   *
   * @param email - 비밀번호를 재설정할 사용자 이메일
   * @param token - 비밀번호 재설정 토큰
   * @param newPassword - 새 비밀번호
   * @returns 비밀번호가 성공적으로 변경된 사용자
   * @throws 비밀번호 재설정 중 오류가 발생한 경우
   */
  public async resetPassword({
    email,
    token,
    newPassword,
  }: {
    email: string;
    token: string;
    newPassword: string;
  }): Promise<User> {
    try {
      this.logger.info(
        {
          methodName: "resetPassword",
          email,
        },
        "비밀번호 재설정 시작",
      );

      // JWT 검증
      const secretKey = createSecretKey();
      const { payload } = await jwtVerify(token, secretKey);
      if (payload.email !== email) {
        throw new Error("비밀번호 재설정 토큰이 유효하지 않습니다.");
      }

      // 비밀번호 해시
      const hashedPassword = await hash(newPassword);

      // 사용자 정보 업데이트
      const user = await this.userModel.update({
        data: {
          hashedPassword,
        },
        where: {
          email, // 이메일로 사용자 업데이트
        },
      });

      this.logger.info(
        {
          methodName: "resetPassword",
          email,
        },
        "비밀번호 재설정 완료",
      );

      return user;
    } catch (error: unknown) {
      // 'unknown' 타입 처리
      if (error instanceof Error) {
        // 'Error'로 타입 단언
        this.logger.error(error.message); // 오류 메시지 기록
      } else {
        this.logger.error("알 수 없는 오류가 발생했습니다.");
      }
      throw error; // 에러 다시 던짐
    }
  }
  /**
   * 현재 비밀번호를 확인하고 새 비밀번호로 변경합니다.
   *
   * @param userId - 비밀번호를 변경할 사용자 ID
   * @param currentPassword - 현재 비밀번호
   * @param newPassword - 새 비밀번호
   * @returns 비밀번호가 성공적으로 변경된 사용자
   * @throws 비밀번호 변경 중 오류가 발생한 경우
   */
  public async changePassword({
    userId,
    currentPassword,
    newPassword,
  }: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<User> {
    try {
      this.logger.info(
        {
          methodName: "changePassword",
          userId,
        },
        "비밀번호 변경 시작",
      );

      // 사용자 조회
      const user = await this.userModel.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      // 기존 비밀번호 확인
      const isMatch = await verify(user.hashedPassword, currentPassword);
      if (!isMatch) {
        throw new Error("현재 비밀번호가 일치하지 않습니다.");
      }

      // 새 비밀번호 해시
      const hashedPassword = await hash(newPassword);

      // 사용자 비밀번호 업데이트
      const updatedUser = await this.userModel.update({
        where: { id: userId },
        data: { hashedPassword },
      });

      this.logger.info(
        {
          methodName: "changePassword",
          userId,
        },
        "비밀번호 변경 완료",
      );

      return updatedUser;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      } else {
        this.logger.error("알 수 없는 오류가 발생했습니다.");
      }
      throw error;
    }
  }
}
