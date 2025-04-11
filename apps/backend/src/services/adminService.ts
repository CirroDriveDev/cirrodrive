import { injectable, inject } from "inversify";
import type { Prisma, User } from "@cirrodrive/database";
import { hash } from "@node-rs/argon2";
import type { Logger } from "pino";
import { Symbols } from "@/types/symbols.ts";

/**
 * 관리자 서비스입니다.
 */
@injectable()
export class AdminService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.UserModel) private userModel: Prisma.UserDelegate,
    @inject(Symbols.FolderModel) private folderModel: Prisma.FolderDelegate,
  ) {
    this.logger = logger.child({ serviceName: "AdminService" });
  }

  /**
   * 새로운 관리자를 생성합니다.
   *
   * @param username - 관리자 이름
   * @param password - 비밀번호
   * @param email - 이메일
   * @param pricingPlan - 관리자 요금제
   * @param profileImageUrl - 프로필 이미지 URL
   * @param usedStorage - 사용된 저장 공간
   * @returns 생성된 관리자
   * @throws 관리자 생성 중 오류가 발생한 경우
   */
  public async create({
    username,
    password,
    email,
    pricingPlan,
    profileImageUrl,
    usedStorage,
    isAdmin,
  }: {
    username: string;
    password: string;
    email: string;
    pricingPlan: "free" | "basic" | "premium";
    profileImageUrl: string | null;
    usedStorage: number;
    isAdmin: boolean;
  }): Promise<User> {
    try {
      this.logger.info(
        {
          methodName: "create",
          username,
          email,
        },
        "관리자 계정 생성 시작",
      );

      const hashedPassword = await hash(password);

      const admin = await this.userModel.create({
        data: {
          username,
          email,
          hashedPassword,
          pricingPlan,
          profileImageUrl,
          usedStorage,
          isAdmin, // 관리자 여부 설정
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
        },
      });

      await this.folderModel.update({
        where: {
          id: admin.rootFolderId,
        },
        data: {
          owner: {
            connect: {
              id: admin.id,
            },
          },
        },
      });

      await this.folderModel.update({
        where: {
          id: admin.trashFolderId,
        },
        data: {
          owner: {
            connect: {
              id: admin.id,
            },
          },
        },
      });

      return admin;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  /**
   * 주어진 ID를 가진 사용자를 삭제합니다.
   *
   * @param userId - 삭제할 유저의 ID
   * @returns 삭제 성공 여부
   * @throws 유저 삭제 중 오류 발생 시
   */
  public async deleteUser(userId: number): Promise<boolean> {
    try {
      this.logger.info({ methodName: "deleteUser", userId }, "유저 삭제 시작");

      const user = await this.userModel.findUnique({
        where: { id: userId },
        include: { rootFolder: true, trashFolder: true },
      });

      if (!user) {
        this.logger.warn({ userId }, "삭제할 유저를 찾을 수 없음");
        return false;
      }

      // 유저 관련 데이터 삭제 (예: 폴더 삭제)
      if (user.rootFolderId) {
        await this.folderModel.delete({ where: { id: user.rootFolderId } });
      }
      if (user.trashFolderId) {
        await this.folderModel.delete({ where: { id: user.trashFolderId } });
      }

      await this.userModel.delete({ where: { id: userId } });

      this.logger.info({ userId }, "유저 삭제 완료");
      return true;
    } catch (error) {
      this.logger.error({ error, userId }, "유저 삭제 실패");
      throw error;
    }
  }
  /**
   * 유저 목록을 조회합니다.
   *
   * @param limit - 가져올 유저 수
   * @param offset - 시작 위치
   * @returns 유저 목록
   * @throws 유저 조회 중 오류 발생 시
   */
  public async getUsers({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }): Promise<User[]> {
    try {
      this.logger.info(
        { methodName: "getUsers", limit, offset },
        "유저 목록 조회 시작",
      );

      const users = await this.userModel.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      });

      this.logger.info({ userCount: users.length }, "유저 목록 조회 성공");

      return users;
    } catch (error) {
      this.logger.error({ error }, "유저 목록 조회 실패");
      throw error;
    }
  }
  /**
   * 주어진 ID를 가진 사용자의 정보를 조회합니다.
   *
   * @param userId - 조회할 유저의 ID
   * @returns 조회된 유저 정보
   * @throws 유저 조회 중 오류 발생 시
   */
  public async getUserById(userId: number): Promise<User | null> {
    try {
      this.logger.info({ methodName: "getUserById", userId }, "유저 조회 시작");

      const user = await this.userModel.findUnique({
        where: { id: userId },
      });

      if (!user) {
        this.logger.warn({ userId }, "조회할 유저를 찾을 수 없음");
      } else {
        this.logger.info({ userId }, "유저 조회 성공");
      }

      return user;
    } catch (error) {
      this.logger.error({ error, userId }, "유저 조회 실패");
      throw error;
    }
  }
  /**
   * 주어진 ID를 가진 사용자의 정보를 업데이트합니다.
   *
   * @param userId - 업데이트할 유저의 ID
   * @param data - 업데이트할 정보
   * @returns 업데이트된 유저 정보
   * @throws 유저 업데이트 중 오류 발생 시
   */
  public async updateUser(
    userId: number,
    data: {
      username?: string;
      password?: string;
      email?: string;
      pricingPlan?: "free" | "basic" | "premium";
      profileImageUrl?: string | null;
      usedStorage?: number;
    },
  ): Promise<User> {
    try {
      this.logger.info(
        { methodName: "updateUser", userId },
        "유저 업데이트 시작",
      );

      const existingUser = await this.userModel.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        this.logger.warn({ userId }, "업데이트할 유저를 찾을 수 없음");
        throw new Error("해당 유저를 찾을 수 없습니다.");
      }

      const updateData: Prisma.UserUpdateInput = {
        username: data.username ?? existingUser.username,
        email: data.email ?? existingUser.email,
        pricingPlan: data.pricingPlan ?? existingUser.pricingPlan,
        profileImageUrl: data.profileImageUrl ?? existingUser.profileImageUrl,
        usedStorage: data.usedStorage ?? existingUser.usedStorage,
      };

      if (data.password) {
        updateData.hashedPassword = await hash(data.password);
      }

      const updatedUser = await this.userModel.update({
        where: { id: userId },
        data: updateData,
      });

      this.logger.info({ userId }, "유저 업데이트 성공");
      return updatedUser;
    } catch (error) {
      this.logger.error({ error, userId }, "유저 업데이트 실패");
      throw error;
    }
  }
  /**
   * 주어진 유저가 관리자 여부를 확인합니다.
   *
   * @param userId - 확인할 유저 ID
   * @returns 관리자인 경우 true, 아니면 false
   * @throws 관리자 여부 조회 중 오류 발생 시
   */
  public async isAdminUser(userId: number): Promise<boolean> {
    try {
      this.logger.info(
        { methodName: "isAdminUser", userId },
        "관리자 여부 확인 시작",
      );

      const user = await this.userModel.findUnique({
        where: { id: userId },
        select: { isAdmin: true },
      });

      const isAdmin = user?.isAdmin ?? false;

      this.logger.info({ userId, isAdmin }, "관리자 여부 확인 성공");
      return isAdmin;
    } catch (error) {
      this.logger.error({ error, userId }, "관리자 여부 확인 실패");
      throw error;
    }
  }
  /**
   * 현재 시스템에 등록된 관리자 수를 반환합니다.
   *
   * @returns 관리자 수
   * @throws 관리자 수 조회 중 오류 발생 시
   */
  public async countAdmins(): Promise<number> {
    try {
      this.logger.info({ methodName: "countAdmins" }, "관리자 수 조회 시작");

      const adminCount = await this.userModel.count({
        where: { isAdmin: true },
      });

      this.logger.info({ adminCount }, "관리자 수 조회 성공");
      return adminCount;
    } catch (error) {
      this.logger.error({ error }, "관리자 수 조회 실패");
      throw error;
    }
  }
}
