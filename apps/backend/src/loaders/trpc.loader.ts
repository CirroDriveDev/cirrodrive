import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { z } from "zod";
import type {
  AdminSession,
  AdminUser,
  Session,
  User,
} from "@cirrodrive/database/prisma";
import { SuperJSON } from "superjson";
import { AuthService } from "#services/auth.service";
import { AdminAuthService } from "#services/admin.auth.service";
import { container } from "#loaders/inversify.loader";

const authService = container.get<AuthService>(AuthService);
const adminAuthService = container.get<AdminAuthService>(AdminAuthService);

export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions) => {
  const ctx = {
    req,
    res,
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
      ctx.admin = admin;
      ctx.adminSession = session;
      ctx.adminSessionToken = adminToken;
      if (session) {
        adminAuthService.setSessionTokenCookie({
          response: res,
          token: adminToken,
          expiresAt: session.expiresAt,
        });
      } else {
        adminAuthService.clearSessionTokenCookie({ response: res });
      }
      return ctx;
    }
  }

  // 기존 일반 사용자 세션 처리 (필요하다면 유지)
  const { data: token, success } = z
    .string()
    .safeParse(req.cookies[AuthService.SESSION_TOKEN_COOKIE_NAME]);

  if (success) {
    const { user, session } = await authService.validateSessionToken({ token });
    ctx.user = user;
    ctx.session = session;
    ctx.sessionToken = token;
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

  return ctx;
};
export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
});

export const createCallerFactory = t.createCallerFactory;
export const middleware = t.middleware;
export const router = t.router;
export const procedure = t.procedure;
export const publicProcedure = procedure;

export const authedProcedure = procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.user || !ctx.session || !ctx.sessionToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return opts.next({
    ctx: {
      user: ctx.user,
      session: ctx.session,
      sessionToken: ctx.sessionToken,
    },
  });
});

export const adminProcedure = procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.admin || !ctx.adminSession || !ctx.adminSessionToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "관리자 인증이 필요합니다.",
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      user: undefined,
      session: undefined,
      sessionToken: undefined,
    },
  });
});
