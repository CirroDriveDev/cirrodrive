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
}
