import { type CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { z } from "zod";
import type {
  AdminSession,
  AdminUser,
  Session,
  User,
} from "@cirrodrive/database/prisma";
import { AuthService } from "#services/auth.service";
import { AdminAuthService } from "#services/admin.auth.service";
import { container } from "#loaders/inversify.loader";

const authService = container.get<AuthService>(AuthService);
const adminAuthService = container.get<AdminAuthService>(AdminAuthService);

/**
 * Main context creator - outer context와 inner context를 결합 기존 API와의 호환성을 위해 유지
 */
export const createContext = async (opts: CreateExpressContextOptions) => {
  const outerCtx = createOuterContext(opts);
  const innerCtx = await createInnerContext(outerCtx);

  innerCtx.logger.info("요청 시작");

  return innerCtx;
};

export type Context = OuterContext & InnerContext;

/**
 * Outer context - 모든 요청에서 기본적으로 사용 가능한 context 인증과 무관하게 항상 제공되는 기본 정보들
 */
export const createOuterContext = (opts: CreateExpressContextOptions) => {
  const { req, res, info } = opts;
  const traceId = req.id;

  const logger = req.log.child({
    traceId,
    path: info.url?.pathname,
  });

  const ip =
    typeof req.headers["x-forwarded-for"] === "string" ?
      req.headers["x-forwarded-for"].split(",")[0].trim()
    : (req.socket.remoteAddress ?? "unknown");

  return {
    req,
    res,
    info,
    logger,
    traceId,
    ip,
  };
};

export type OuterContext = ReturnType<typeof createOuterContext>;

/**
 * Inner context - 인증 정보가 포함된 context outer context를 확장하여 사용자 인증 정보를 추가
 */
export const createInnerContext = async (outerCtx: OuterContext) => {
  const { req, res } = outerCtx;

  const innerCtx = {
    ...outerCtx,
    user: null as User | null,
    session: null as Session | null,
    sessionToken: null as string | null,
    admin: null as AdminUser | null,
    adminSession: null as AdminSession | null,
    adminSessionToken: null as string | null,
  };

  // 관리자 세션 토큰을 가져옵니다.
  const { data: adminToken, success: adminSuccess } = z
    .string()
    .safeParse(req.cookies[AdminAuthService.SESSION_TOKEN_COOKIE_NAME]);

  if (adminSuccess) {
    const { admin, session } = await adminAuthService.validateSessionToken({
      token: adminToken,
    });
    if (admin) {
      innerCtx.admin = admin;
      innerCtx.adminSession = session;
      innerCtx.adminSessionToken = adminToken;
      if (session) {
        adminAuthService.setSessionTokenCookie({
          response: res,
          token: adminToken,
          expiresAt: session.expiresAt,
        });
      } else {
        adminAuthService.clearSessionTokenCookie({ response: res });
      }
    }
  }

  // 기존 일반 사용자 세션 처리
  const { data: token, success } = z
    .string()
    .safeParse(req.cookies[AuthService.SESSION_TOKEN_COOKIE_NAME]);

  if (success) {
    const { user, session } = await authService.validateSessionToken({ token });
    innerCtx.user = user;
    innerCtx.session = session;
    innerCtx.sessionToken = token;
    if (session) {
      authService.setSessionTokenCookie({
        response: res,
        token,
        expiresAt: session.expiresAt,
      });
    } else {
      authService.clearSessionTokenCookie({ response: res });
    }
  }

  return innerCtx;
};

export type InnerContext = Awaited<ReturnType<typeof createInnerContext>>;
