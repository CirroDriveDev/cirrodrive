import { initTRPC } from "@trpc/server";
import { z } from "zod";
import express from "express";
import cookieParser from "cookie-parser";
import {
  type CreateExpressContextOptions,
  createExpressMiddleware,
} from "@trpc/server/adapters/express";
import { SuperJSON } from "superjson";

const sessionStore: Record<string, { username: string }> = {};

const generateSessionId = (): string =>
  Math.random().toString(36).substring(2, 15);

const createContext = ({ req, res }: CreateExpressContextOptions) => {
  const sessionId = req.cookies["session-id"] as string; // 쿠키에서 세션 ID 가져오기
  const session = sessionId ? sessionStore[sessionId] : null;
  return {
    req,
    res,
    session,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({ transformer: SuperJSON });

export const appRouter = t.router({
  // login 프로시저 추가
  login: t.procedure
    .input(z.object({ username: z.string() }))
    .mutation(({ input, ctx }) => {
      const sessionId = generateSessionId();
      sessionStore[sessionId] = { username: input.username };

      // Set-Cookie 헤더로 세션 ID를 클라이언트에 설정
      ctx.res.cookie("session-id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return { message: "Logged in successfully" };
    }),

  // profile 프로시저 추가
  profile: t.procedure
    .input(z.object({ detailed: z.boolean().optional() }))
    .query(({ input, ctx }) => {
      if (!ctx.session) {
        throw new Error("Unauthorized");
      }
      const { username } = ctx.session;
      if (input.detailed) {
        return {
          username,
          details: "This is detailed user information.",
        };
      }
      return { username };
    }),
});

export type AppRouter = typeof appRouter;

const app = express();
app.use(express.json());
app.use(cookieParser()); // 쿠키 파서 미들웨어 추가

// tRPC 미들웨어 설정
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

// 기본 서버 실행
const PORT = 4000;
app.listen(PORT);

export { app };
