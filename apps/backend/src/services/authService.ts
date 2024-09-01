import { Lucia, Session } from "lucia";
import { injectable, inject } from "inversify";
import { Prisma, User } from "@prisma/client";
import { Argon2id } from "oslo/password";
import type { Logger } from "pino";
import { Symbols } from "@/types/symbols.ts";
import { UserValidationService } from "@/services/userValidationService.ts";

const argon2id = new Argon2id();

/**
 * 인증 서비스입니다.
 */
@injectable()
export class AuthService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.UserModel) private userModel: Prisma.UserDelegate,
    @inject(Symbols.Lucia) private lucia: Lucia,
    @inject(UserValidationService)
    private userValidationService: UserValidationService,
  ) {
    this.logger = logger.child({ prefix: "AuthService" });
  }

  /**
   * 사용자를 로그인합니다.
   * @param username - 사용자 이름
   * @param password - 비밀번호
   * @returns 생성된 세션
   * @throws 사용자 이름이 유효하지 않은 경우.
   * @throws 비밀번호가 유효하지 않은 경우.
   * @throws 사용자를 찾을 수 없는 경우.
   * @throws 비밀번호가 일치하지 않는 경우.
   * @throws 세션을 생성하는 중 오류가 발생한 경우.
   **/
  public async login(username: string, password: string): Promise<Session> {
    this.logger.info("로그인 중");
    if (!this.userValidationService.validateUsername(username)) {
      throw new Error("사용자 이름이 유효하지 않습니다");
    }
    if (!this.userValidationService.validatePassword(password)) {
      throw new Error("비밀번호가 유효하지 않습니다");
    }

    const user = await this.userModel.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다");
    }

    if (!(await argon2id.verify(user.password, password))) {
      throw new Error("비밀번호가 일치하지 않습니다");
    }

    const session = await this.lucia.createSession(user.id, {});

    return session;
  }

  /**
   * 사용자를 로그아웃합니다.
   * @param sessionId - 세션 ID
   * @throws 세션을 찾을 수 없는 경우.
   * @throws 세션을 무효화하는 중 오류가 발생한 경우.
   **/
  public async logout(sessionId: string): Promise<void> {
    const { session } = await this.lucia.validateSession(sessionId);
    if (!session) {
      throw new Error("세션을 찾을 수 없습니다");
    }

    await this.lucia.invalidateSession(sessionId);
  }

  /**
   * 세션을 검증합니다.
   * @param sessionId - 세션 ID
   * @returns 사용자와 세션
   * @throws 세션을 찾을 수 없는 경우.
   * @throws 사용자를 찾을 수 없는 경우.
   **/
  public async validateSession(
    sessionId: string,
  ): Promise<{ user: User; session: Session }> {
    const { session } = await this.lucia.validateSession(sessionId);

    if (!session) {
      throw new Error("세션을 찾을 수 없습니다");
    }

    const user = await this.userModel.findUnique({
      where: {
        id: session.userId,
      },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다");
    }

    return { user, session };
  }
}
