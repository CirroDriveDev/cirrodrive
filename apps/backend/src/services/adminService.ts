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
          isAdmin: true, // 관리자 여부 설정
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
}
