import { z } from "zod"; // zod 임포트 추가
import { router, procedure } from "@/loaders/trpc.ts";

export const adminRouter = router({
  create: procedure
    .input(
      // 프로시저 내부 로직은 비워두고, 호출 시 에러가 발생하도록 설정
      z.object({
        username: z.string(),
        password: z.string(),
        email: z.string().email(),
        token: z.string(),
      }),
    )
    .mutation(() => {
      throw new Error("create 프로시저는 아직 구현되지 않았습니다.");
    }),

  update: procedure
    .input(
      // 프로시저 내부 로직은 비워두고, 호출 시 에러가 발생하도록 설정
      z.object({
        id: z.number(),
        username: z.string(),
        password: z.string(),
        email: z.string().email(),
      }),
    )
    .mutation(() => {
      throw new Error("update 프로시저는 아직 구현되지 않았습니다.");
    }),

  delete: procedure
    .input(
      // 프로시저 내부 로직은 비워두고, 호출 시 에러가 발생하도록 설정
      z.object({
        id: z.number(),
      }),
    )
    .mutation(() => {
      throw new Error("delete 프로시저는 아직 구현되지 않았습니다.");
    }),

  list: procedure
    .input(
      // 프로시저 내부 로직은 비워두고, 호출 시 에러가 발생하도록 설정
      z.object({
        limit: z.number(),
        offset: z.number(),
      }),
    )
    .query(() => {
      throw new Error("list 프로시저는 아직 구현되지 않았습니다.");
    }),

  get: procedure
    .input(
      // 프로시저 내부 로직은 비워두고, 호출 시 에러가 발생하도록 설정
      z.object({
        id: z.number(),
      }),
    )
    .query(() => {
      throw new Error("get 프로시저는 아직 구현되지 않았습니다.");
    }),
});
