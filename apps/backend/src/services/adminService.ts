import { injectable, inject } from "inversify";
import type { Prisma, User } from "@cirrodrive/database";
import { hash } from "@node-rs/argon2";
import { jwtVerify } from "jose";
import type { Logger } from "pino";
import { Symbols } from "@/types/symbols.ts";
import { createSecretKey } from "@/utils/jwt.ts";

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
   * @param username - 사용자 이름
   * @param password - 비밀번호
   * @param email - 이메일
   * @param token - 이메일 인증 토큰
   * @returns 생성된 관리자 정보
   */
  public async create({
    username,
    password,
    email,
    token,
  }: {
    username: string;
    password: string;
    email: string;
    token: string;
  }): Promise<User> {
    try {
      this.logger.info(
        { methodName: "create", username, email },
        "관리자 생성 시작",
      );

      // JWT 검증
      const secretKey = createSecretKey();
      const { payload } = await jwtVerify(token, secretKey);
      if (payload.email !== email) {
        throw new Error("이메일 인증 토큰이 유효하지 않습니다.");
      }

      const hashedPassword = await hash(password);

      const user = await this.userModel.create({
        data: {
          username,
          email,
          hashedPassword,
          role: "admin", // 관리자는 "admin" 역할로 설정
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

      // 폴더 소유자 연결
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
   * 이메일이 이미 존재하는지 확인합니다.
   *
   * @param email - 이메일
   * @returns 이메일이 이미 존재하는지 여부
   */
  public async existsByEmail({ email }: { email: string }): Promise<boolean> {
    try {
      this.logger.info(
        { methodName: "existsByEmail", email },
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
        { methodName: "existsByUsername", username },
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
}
