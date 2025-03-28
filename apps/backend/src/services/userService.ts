import { injectable, inject } from "inversify";
import type { Prisma, User } from "@cirrodrive/database";
import { hash } from "@node-rs/argon2";
import type { Logger } from "pino";
import { Symbols } from "@/types/symbols.ts";
import { sendVerificationEmail } from "@/utils/sendVerificationEmail.ts";
import { generateVerificationCode } from "@/utils/generateVerificationCode.ts";

/**
 * 사용자 서비스입니다.
 */
@injectable()
export class UserService {
  private verificationCodes = new Map<string, string>();
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.UserModel) private userModel: Prisma.UserDelegate,
    @inject(Symbols.FolderModel) private folderModel: Prisma.FolderDelegate,
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
  public async create({
    username,
    password,
    email,
  }: {
    username: string;
    password: string;
    email: string;
  }): Promise<User> {
    try {
      this.logger.info(
        { methodName: "create", username, email },
        "사용자 생성 시작",
      );

      const hashedPassword = await hash(password);

      const user = await this.userModel.create({
        data: {
          username,
          email,
          hashedPassword,
          rootFolder: {
            create: { name: "root" },
          },
          trashFolder: {
            create: { name: "trash" },
          },
        },
      });

      await this.folderModel.update({
        where: { id: user.rootFolderId },
        data: { owner: { connect: { id: user.id } } },
      });

      await this.folderModel.update({
        where: { id: user.trashFolderId },
        data: { owner: { connect: { id: user.id } } },
      });

      return user;
    } catch (error) {
      if (error instanceof Error) this.logger.error(error.message);
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
        { methodName: "list", limit, offset },
        "사용자 목록 조회 시작",
      );

      return await this.userModel.findMany({ take: limit, skip: offset });
    } catch (error) {
      if (error instanceof Error) this.logger.error(error.message);
      throw error;
    }
  }

  /**
   * 사용자를 조회합니다.
   *
   * @param id - 사용자 ID
   * @returns 지정된 ID를 가진 사용자 또는 null
   */
  public async get({ id }: { id: number }): Promise<User | null> {
    try {
      this.logger.info({ methodName: "get", id }, "사용자 조회 시작");

      return await this.userModel.findUnique({ where: { id } });
    } catch (error) {
      if (error instanceof Error) this.logger.error(error.message);
      throw error;
    }
  }

  /**
   * 사용자 이름으로 사용자를 조회합니다.
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
        { methodName: "getByUsername", username },
        "사용자 조회 시작",
      );

      return await this.userModel.findUnique({ where: { username } });
    } catch (error) {
      if (error instanceof Error) this.logger.error(error.message);
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

      return await this.userModel.findUnique({ where: { email } });
    } catch (error) {
      if (error instanceof Error) this.logger.error(error.message);
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
  public async update({
    id,
    username,
    password,
    email,
  }: {
    id: number;
    username: string;
    password: string;
    email: string;
  }): Promise<User> {
    try {
      this.logger.info(
        { methodName: "updateUser", id, username, password: "********", email },
        "사용자 수정 시작",
      );

      const hashedPassword = await hash(password);

      return await this.userModel.update({
        data: { username, hashedPassword, email },
        where: { id },
      });
    } catch (error) {
      if (error instanceof Error) this.logger.error(error.message);
      throw error;
    }
  }

  /**
   * 사용자를 삭제합니다.
   *
   * @param id - 사용자 ID
   * @returns 삭제된 사용자
   */
  public async delete({ id }: { id: number }): Promise<User> {
    try {
      this.logger.info({ methodName: "delete", id }, "사용자 삭제 시작");

      return await this.userModel.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Error) this.logger.error(error.message);
      throw error;
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

      return (
        (await this.userModel.findUnique({ where: { username } })) !== null
      );
    } catch (error) {
      if (error instanceof Error) this.logger.error(error.message);
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

      return (await this.userModel.findUnique({ where: { email } })) !== null;
    } catch (error) {
      if (error instanceof Error) this.logger.error(error.message);
      throw error;
    }
  }
  /**
   * 이메일 인증 코드를 발송합니다.
   *
   * @param email - 인증 코드를 발송할 사용자 이메일 주소입니다.
   * @throws 인증 코드 발송 중 오류가 발생한 경우.
   */
  public async sendVerificationCode(email: string): Promise<void> {
    try {
      const code = generateVerificationCode(); // 6자리 인증 코드 생성
      this.verificationCodes.set(email, code); // 코드 저장

      // 인증 이메일 발송 (3개의 인수로 수정)
      await sendVerificationEmail(email, code, this.logger); // 이메일 발송
      this.logger.info({ email, code }, "인증 코드 발송 완료");
    } catch (error) {
      this.logger.error({ email, error }, "인증 코드 발송 실패");
      throw new Error("인증 코드 발송 실패");
    }
  }

  /**
   * 사용자가 입력한 이메일 인증 코드가 유효한지 검증합니다.
   *
   * @param email - 인증 코드를 검증할 사용자 이메일 주소입니다.
   * @param code - 사용자가 입력한 인증 코드입니다.
   * @returns 인증 코드가 유효하면 `true`, 그렇지 않으면 `false`를 반환합니다.
   */
  public verifyEmailCode(email: string, code: string): boolean {
    const storedCode = this.verificationCodes.get(email); // 저장된 인증 코드 가져오기

    if (storedCode === code) {
      this.logger.info({ email }, "이메일 인증 성공");
      return true; // 인증 성공
    }
    this.logger.error({ email }, "잘못된 인증 코드");
    return false; // 인증 실패
  }
}
