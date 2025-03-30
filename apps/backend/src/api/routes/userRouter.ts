import { userDTOSchema, userSchema } from "@cirrodrive/schemas";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { container } from "@/loaders/inversify.ts";
import { UserService } from "@/services/userService.ts";
import { logger } from "@/loaders/logger.ts";
import { router, procedure, authedProcedure } from "@/loaders/trpc.ts";

const userService = container.get<UserService>(UserService);

export const userRouter = router({
  create: procedure
    .input(
      userSchema
        .pick({
          username: true,
          password: true,
          email: true,
        })
        .extend({
          token: z.string(), // 추가: 이메일 인증 토큰
        }),
    )
    .output(userDTOSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "user.create 요청 시작");
      if (ctx.user) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "이미 로그인되어 있습니다.",
        });
      }

      if (await userService.existsByUsername({ username: input.username })) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "이미 사용 중인 사용자 이름입니다.",
        });
      }

      if (await userService.existsByEmail({ email: input.email })) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "이미 사용 중인 이메일 주소입니다.",
        });
      }
      try {
        const user = await userService.create({
          username: input.username,
          password: input.password,
          email: input.email,
          token: input.token, // 추가
        });

        logger.info({ requestId: ctx.req.id }, "user.create 요청 성공");

        return user;
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "user.create 요청 실패");

        throw Error("알 수 없는 오류가 발생했습니다.");
      }
    }),

  list: procedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        offset: z.number().optional().default(0),
      }),
    )
    .output(z.array(userDTOSchema))
    .query(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "user.list 요청 시작");
      try {
        const users = await userService.list({
          limit: input.limit,
          offset: input.offset,
        });

        logger.info({ requestId: ctx.req.id }, "user.list 요청 성공");

        return users;
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "user.list 요청 실패");

        throw Error("알 수 없는 오류가 발생했습니다.");
      }
    }),

  me: authedProcedure.output(userDTOSchema).query(({ ctx }) => {
    logger.info({ requestId: ctx.req.id }, "user.me 요청 시작");
    return ctx.user;
  }),

  get: procedure
    .input(userSchema.shape.id)
    .output(userDTOSchema)
    .query(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "user.get 요청 시작");
      let user = null;

      try {
        user = await userService.get({ id: input });
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "user.get 요청 실패");

        throw Error("알 수 없는 오류가 발생했습니다.");
      }

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "사용자를 찾을 수 없습니다.",
        });
      }

      return user;
    }),

  update: authedProcedure
    .input(
      userSchema.pick({
        username: true,
        password: true,
        email: true,
      }),
    )
    .output(userDTOSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "user.update 요청 시작");

      try {
        const user = await userService.update({
          id: ctx.user.id,
          username: input.username,
          password: input.password,
          email: input.email,
        });

        return user;
      } catch (error) {
        logger.error({ requestId: ctx.req.id, error }, "user.update 요청 실패");

        throw Error("알 수 없는 오류가 발생했습니다.");
      }
    }),

  delete: authedProcedure.output(userDTOSchema).mutation(async ({ ctx }) => {
    logger.info({ requestId: ctx.req.id }, "user.delete 요청 시작");

    try {
      const user = await userService.delete({ id: ctx.user.id });

      return user;
    } catch (error) {
      logger.error({ requestId: ctx.req.id, error }, "user.delete 요청 실패");

      throw Error("알 수 없는 오류가 발생했습니다.");
    }
  }),
});
