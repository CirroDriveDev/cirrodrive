import { injectable, inject } from "inversify";
import type { AdminUser, AdminSession } from "@cirrodrive/database/prisma";
import { verify } from "@node-rs/argon2";
import type { Logger } from "pino";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { Response } from "express";
import { Symbols } from "#types/symbols";
import { AdminUserRepository } from "#repositories/admin-user.repository";
import { AdminSessionRepository } from "#repositories/admin-session.repository";

/**
 * 관리자 인증 서비스입니다.
 */
@injectable()
export class AdminAuthService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(AdminUserRepository)
    private adminUserRepository: AdminUserRepository,
    @inject(AdminSessionRepository)
    private adminSessionRepository: AdminSessionRepository,
  ) {
    this.logger = logger.child({ prefix: "AdminAuthService" });
  }

  public static SESSION_TOKEN_COOKIE_NAME = "admin_auth_session" as const;

  /**
   * 관리자를 로그인합니다.
   *
   * @param email - 관리자 이메일
   * @param password - 비밀번호
   * @returns 생성된 세션의 토큰
   */
  public async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ admin: AdminUser; session: AdminSession; token: string }> {
    this.logger.info({ methodName: "login" }, "관리자 로그인 시도");
    const admin = await this.adminUserRepository.findByEmail(email);
    if (!admin) {
      throw new Error("관리자를 찾을 수 없습니다");
    }
    if (!(await verify(admin.password, password))) {
      throw new Error("비밀번호가 일치하지 않습니다");
    }
    const token = this.generateSessionToken();
    const session = await this.createSession({ token, adminId: admin.id });
    return { admin, token, session };
  }

  /**
   * 로그아웃 (세션 삭제)
   */
  public async logout({ token }: { token: string }): Promise<void> {
    this.logger.info({ methodName: "logout" }, "관리자 로그아웃 중");
    const sessionId = this.encodeToken(token);
    await this.invalidateSession({ sessionId });
  }

  /**
   * 세션을 검증합니다.
   */
  public async validateSessionToken({
    token,
  }: {
    token: string;
  }): Promise<{ session: AdminSession | null; admin: AdminUser | null }> {
    this.logger.info({ methodName: "validateSessionToken" }, "세션 검증 중");
    const sessionId = this.encodeToken(token);
    const session = await this.adminSessionRepository.findById(sessionId);
    if (!session) return { session: null, admin: null };
    const admin = await this.adminUserRepository.findById(session.adminId);
    if (!admin) return { session: null, admin: null };
    if (Date.now() >= session.expiresAt.getTime()) {
      await this.invalidateSession({ sessionId });
      return { session: null, admin: null };
    }
    return { session, admin };
  }

  /**
   * 세션 토큰 쿠키를 설정합니다.
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
    res.cookie(AdminAuthService.SESSION_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
      secure: process.env.PROD === "true",
    });
  }

  /**
   * 세션 토큰 쿠키를 삭제합니다.
   */
  public clearSessionTokenCookie({ response }: { response: Response }): void {
    this.setSessionTokenCookie({ response, token: "", expiresAt: new Date(0) });
  }

  /**
   * 세션을 생성합니다.
   */
  private async createSession({
    token,
    adminId,
  }: {
    token: string;
    adminId: string;
  }): Promise<AdminSession> {
    this.logger.info({ methodName: "createSession" }, "관리자 세션 생성 중");
    const sessionId = this.encodeToken(token);
    const session = await this.adminSessionRepository.create({
      id: sessionId,
      adminId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
    });
    return session;
  }
  private async invalidateSession({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<void> {
    await this.adminSessionRepository.delete(sessionId);
  }

  /**
   * 세션 토큰을 생성합니다.
   */
  private generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    return encodeBase32LowerCaseNoPadding(bytes);
  }

  /**
   * 세션 토큰을 해시합니다.
   */
  private encodeToken(token: string): string {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  }
}
