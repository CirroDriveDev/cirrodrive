import { injectable, inject } from "inversify";
import type { Prisma, User, Session } from "@cirrodrive/database/prisma";
import { verify } from "@node-rs/argon2";
import type { Logger } from "pino";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { Response } from "express";
import { Symbols } from "#types/symbols";
import { type SessionValidationResult } from "#types/types";

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

  public static SESSION_TOKEN_COOKIE_NAME = "auth_session" as const;

  /**
   * 사용자를 로그인합니다.
   *
   * @param username - 사용자 이름
   * @param password - 비밀번호
   * @returns 생성된 세션의 토큰
   */
  public async login({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{ user: User; session: Session; token: string }> {
    this.logger.info({ methodName: "login" }, "로그인 중");

    const user = await this.userModel.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다");
    }

    if (!(await verify(user.hashedPassword, password))) {
      throw new Error("비밀번호가 일치하지 않습니다");
    }

    const token = this.generateSessionToken();

    const session = await this.createSession({ token, userId: user.id });

    return { user, token, session };
  }

  /**
   * 사용자를 로그아웃합니다.
   *
   * @param token - 세션 ID
   */
  public async logout({ token }: { token: string }): Promise<void> {
    this.logger.info({ methodName: "logout" }, "로그아웃 중");
    const sessionId = this.encodeToken(token);

    await this.invalidateSession({ sessionId });
  }

  /**
   * 세션을 검증합니다.
   *
   * @param token - 세션 토큰
   * @returns 사용자와 세션
   */
  public async validateSessionToken({
    token,
  }: {
    token: string;
  }): Promise<SessionValidationResult> {
    this.logger.info({ methodName: "validateSessionToken" }, "세션 검증 중");
    const sessionId = this.encodeToken(token);

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
      await this.invalidateSession({ sessionId });
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

  /**
   * 세션 토큰 쿠키를 설정합니다.
   *
   * @param response - 응답 객체
   * @param token - 세션 토큰
   * @param expiresAt - 만료 시각
   */
  public setSessionTokenCookie({
    response: res,
    token,
    expiresAt,
  }: {
    response: Response;
    token: string;
    expiresAt: Date;
  }): void {
    res.cookie(AuthService.SESSION_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
      secure: process.env.PROD === "true",
    });
  }

  /**
   * 세션 토큰 쿠키를 삭제합니다.
   *
   * @param response - 응답 객체
   */
  public clearSessionTokenCookie({ response }: { response: Response }): void {
    this.setSessionTokenCookie({ response, token: "", expiresAt: new Date(0) });
  }

  /**
   * 사용자의 활성 세션 목록을 조회합니다.
   *
   * @param userId - 사용자 ID
   * @param currentSessionToken - 현재 세션 토큰
   * @returns 세션 목록
   */
  public async getUserSessions({
    userId,
    currentSessionToken,
  }: {
    userId: string;
    currentSessionToken?: string;
  }): Promise<
    {
      id: string;
      deviceName: string;
      ipAddress: string;
      lastActivity: string;
      isCurrent: boolean;
    }[]
  > {
    this.logger.info(
      { methodName: "getUserSessions" },
      "사용자 세션 목록 조회 중",
    );

    const sessions = await this.sessionModel.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(), // 만료되지 않은 세션만
        },
      },
      orderBy: {
        expiresAt: "desc", // 최신 활동 순
      },
    });

    const currentSessionId =
      currentSessionToken ? this.encodeToken(currentSessionToken) : null;

    return sessions.map((session) => ({
      id: session.id,
      deviceName: this.getDeviceNameFromUserAgent(), // 실제 환경에서는 User-Agent 파싱 필요
      ipAddress: "0.0.0.0", // 실제 환경에서는 세션 생성 시 IP 저장 필요
      lastActivity: session.expiresAt.toISOString(),
      isCurrent: session.id === currentSessionId,
    }));
  }

  /**
   * 특정 세션을 로그아웃합니다 (원격 로그아웃).
   *
   * @param sessionId - 세션 ID
   * @param userId - 사용자 ID (보안을 위한 검증용)
   */
  public async logoutSpecificSession({
    sessionId,
    userId,
  }: {
    sessionId: string;
    userId: string;
  }): Promise<void> {
    this.logger.info(
      { methodName: "logoutSpecificSession" },
      "특정 세션 로그아웃 중",
    );

    // 해당 세션이 요청한 사용자의 것인지 확인
    const session = await this.sessionModel.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("세션을 찾을 수 없습니다.");
    }

    if (session.userId !== userId) {
      throw new Error("권한이 없습니다.");
    }

    await this.invalidateSession({ sessionId });
  }

  /**
   * 세션을 생성합니다.
   *
   * @param token - 세션 토큰
   * @param userId - 사용자 ID
   * @returns 생성된 세션
   */
  private async createSession({
    token,
    userId,
  }: {
    token: string;
    userId: string;
  }): Promise<Session> {
    this.logger.info({ methodName: "createSession" }, "세션 생성 중");
    const sessionId = this.encodeToken(token);
    const session: Session = {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // 1 days
    };

    this.logger.info(
      { methodName: "createSession", session },
      "세션 생성 완료",
    );

    await this.sessionModel.create({
      data: session,
    });
    return session;
  }

  private async invalidateSession({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<void> {
    await this.sessionModel.delete({ where: { id: sessionId } });
  }

  /**
   * 세션 토큰을 생성합니다.
   *
   * @returns 세션 토큰
   */
  private generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
  }

  /**
   * 세션 토큰을 해시합니다.
   *
   * @param token - 세션 토큰
   * @returns 해시된 세션 ID
   */
  private encodeToken(token: string): string {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  }

  /**
   * User-Agent에서 디바이스 이름을 추출합니다. 실제 환경에서는 더 정교한 파싱이 필요합니다.
   */
  private getDeviceNameFromUserAgent(): string {
    // 간단한 예시 - 실제로는 User-Agent 파싱 라이브러리 사용 권장
    return "Web Browser";
  }
}
