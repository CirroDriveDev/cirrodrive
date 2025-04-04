import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { z } from "zod";
import type { Session, User } from "@cirrodrive/database";
import { SuperJSON } from "superjson";
import { AuthService } from "@/services/authService.ts";
import { container } from "@/loaders/inversify.ts";

const authService = container.get<AuthService>(AuthService);

export const createContext = async ({
  req,
  res,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- 타입은 자동으로 추론됩니다.
}: CreateExpressContextOptions) => {
  const ctx = {
    req,
    res,
    user: null as User | null,
    session: null as Session | null,
    sessionToken: null as string | null,
  };

  // 세션 토큰을 가져옵니다.
  const { data: token, success } = z
    .string()
    .safeParse(req.cookies[AuthService.SESSION_TOKEN_COOKIE_NAME]);

  // 세션 토큰이 존재하는 경우 사용자와 세션을 가져옵니다.
  if (success) {
    const { user, session } = await authService.validateSessionToken({ token });
    ctx.user = user;
    ctx.session = session;
    ctx.sessionToken = token;

    // 세션 토큰 쿠키를 갱신합니다.
    if (session) {
      authService.setSessionTokenCookie({
        response: res,
        token,
        expiresAt: session.expiresAt,
      });
    } else {
      authService.clearSessionTokenCookie({
        response: res,
      });
    }
  }

  return ctx;
};
export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
});

export const router = t.router;
export const procedure = t.procedure;

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
  if (!ctx.user || ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return opts.next({
    ctx: {
      user: ctx.user,
      session: ctx.session,
      sessionToken: ctx.sessionToken,
    },
  });
});
