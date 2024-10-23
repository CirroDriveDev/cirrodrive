import { injectable, inject } from "inversify";
import { Prisma, User, Session } from "@prisma/client";
import { verify } from "@node-rs/argon2";
import type { Logger } from "pino";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { Response } from "express";
import { Symbols } from "@/types/symbols.ts";
import { SessionValidationResult } from "@/types/types.ts";

/**
 * 인증 서비스입니다.
 */
@injectable()
export class AuthService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.UserModel) private userModel: Prisma.UserDelegate,
    @inject(Symbols.SessionModel) private sessionModel: Prisma.SessionDelegate,
  ) {
    this.logger = logger.child({ prefix: "AuthService" });
  }

  public static SESSION_TOKEN_COOKIE_NAME = "session" as const;

  /**
   * 사용자를 로그인합니다.
   * @param username - 사용자 이름
   * @param password - 비밀번호
   * @returns 생성된 세션의 토큰
   * @throws 사용자를 찾을 수 없는 경우.
   * @throws 비밀번호가 일치하지 않는 경우.
   * @throws 세션을 생성하는 중 오류가 발생한 경우.
   **/
  public async login(
    username: string,
    password: string,
  ): Promise<{ user: User; session: Session; token: string }> {
    this.logger.info({ methodName: "login" }, "로그인 중");

    const user = await this.userModel.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다");
    }

    if (!(await verify(user.password, password))) {
      throw new Error("비밀번호가 일치하지 않습니다");
    }

    const token = this.generateSessionToken();

    const session = await this.createSession(token, user.id);

    return { user, token, session };
  }

  /**
   * 사용자를 로그아웃합니다.
   * @param token - 세션 ID
   * @throws 세션을 찾을 수 없는 경우.
   * @throws 세션을 무효화하는 중 오류가 발생한 경우.
   **/
  public async logout(token: string): Promise<void> {
    this.logger.info({ methodName: "logout" }, "로그아웃 중");
    const sessionId = this.encodeSessionId(token);

    await this.invalidateSession(sessionId);
  }

  /**
   * 세션을 검증합니다.
   * @param sessionId - 세션 ID
   * @returns 사용자와 세션
   * @throws 세션을 찾을 수 없는 경우.
   * @throws 사용자를 찾을 수 없는 경우.
   **/
  public async validateSessionToken(
    token: string,
  ): Promise<SessionValidationResult> {
    this.logger.info({ methodName: "validateSessionToken" }, "세션 검증 중");
    const sessionId = this.encodeSessionId(token);

    const result = await this.sessionModel.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });

    if (result === null) {
      return { session: null, user: null };
    }

    const { user, ...session } = result;

    if (Date.now() >= session.expiresAt.getTime()) {
      await this.invalidateSession(sessionId);
      return { session: null, user: null };
    }

    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
      session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      await this.sessionModel.update({
        where: {
          id: session.id,
        },
        data: {
          expiresAt: session.expiresAt,
        },
      });
    }

    return { session, user };
  }

  public setSessionTokenCookie(
    response: Response,
    token: string,
    expiresAt: Date,
  ): void {
    this.logger.info(
      { methodName: "setSessionTokenCookie" },
      "세션 쿠키 설정 중",
    );

    if (import.meta.env.PROD) {
      response.set(
        "Set-Cookie",
        `${AuthService.SESSION_TOKEN_COOKIE_NAME}=${token}; HTTPOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/; Secure;`,
      );
    } else {
      response.set(
        "Set-Cookie",
        `${AuthService.SESSION_TOKEN_COOKIE_NAME}=${token}; HTTPOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/;`,
      );
    }
  }

  public deleteSessionTokenCookie(response: Response): void {
    this.logger.info(
      { methodName: "deleteSessionTokenCookie" },
      "세션 쿠키 삭제 중",
    );
    if (import.meta.env.PROD) {
      response.set(
        "Set-Cookie",
        `${AuthService.SESSION_TOKEN_COOKIE_NAME}=; HTTPOnly; SameSite=Lax; Max-Age=0; Path=/ ;Secure;`,
      );
    } else {
      response.set(
        "Set-Cookie",
        `${AuthService.SESSION_TOKEN_COOKIE_NAME}=; HTTPOnly; SameSite=Lax; Max-Age=0; Path=/;`,
      );
    }
  }

  private async createSession(token: string, userId: number): Promise<Session> {
    const sessionId = this.encodeSessionId(token);
    const session: Session = {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    };
    await this.sessionModel.create({
      data: session,
    });
    return session;
  }

  private async invalidateSession(sessionId: string): Promise<void> {
    await this.sessionModel.delete({ where: { id: sessionId } });
  }

  private generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
  }

  private encodeSessionId(sessionId: string): string {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(sessionId)));
  }
}
