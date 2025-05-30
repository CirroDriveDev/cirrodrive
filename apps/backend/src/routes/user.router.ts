import { userDTOSchema, userSchema } from "@cirrodrive/schemas/user";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { container } from "#loaders/inversify.loader";
import { UserService } from "#services/user.service";
import { logger } from "#loaders/logger.loader";
import { router, procedure, authedProcedure } from "#loaders/trpc.loader";

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
  findUsername: procedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .output(
      z.object({
        username: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "user.findUsername 요청 시작");

      try {
        const user = await userService.findByEmail({ email: input.email });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "해당 이메일로 등록된 계정을 찾을 수 없습니다.",
          });
        }

        logger.info({ requestId: ctx.req.id }, "user.findUsername 요청 성공");

        return { username: user.username };
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "user.findUsername 요청 실패",
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "아이디 찾기 중 오류가 발생했습니다.",
        });
      }
    }),
  resetPassword: procedure
    .input(
      z.object({
        email: z.string().email(), // email을 받도록 수정
        token: z.string(),
        newPassword: z.string().min(8),
      }),
    )
    .output(userDTOSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "user.resetPassword 요청 시작");

      try {
        const { email, token, newPassword } = input; // email도 input에서 추출

        // resetPassword 호출 시 email 포함
        const user = await userService.resetPassword({
          email,
          token,
          newPassword,
        });

        logger.info({ requestId: ctx.req.id }, "user.resetPassword 요청 성공");

        return user;
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "user.resetPassword 요청 실패",
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "비밀번호 재설정 중 오류가 발생했습니다.",
        });
      }
    }),
  /**
   * 현재 비밀번호 인증 후 새 비밀번호로 변경합니다.
   *
   * @throws
   *
   *   - UNAUTHORIZED: 현재 비밀번호가 일치하지 않음
   *   - BAD_REQUEST: 새 비밀번호 확인이 일치하지 않거나 조건이 맞지 않음
   *   - INTERNAL_SERVER_ERROR: 서버 내부 오류
   *
   * @input
   *  - currentPassword: 현재 비밀번호 (최소 8자)
   *  - newPassword: 새 비밀번호 (최소 8자, 특수문자 및 대문자 포함 필수)
   *  - confirmNewPassword: 새 비밀번호 확인용 (newPassword와 일치해야 함)
   *
   * @validation
   *  - newPassword는 다음 조건을 만족해야 합니다:
   *    - 최소 하나 이상의 대문자 포함
   *    - 최소 하나 이상의 특수문자 포함 (!@#$%^&* 등)
   *  - newPassword와 confirmNewPassword는 반드시 일치해야 합니다.
   *
   * @output
   *  - 사용자 DTO 정보 반환 (userDTOSchema)
   */
  changePassword: authedProcedure
    .input(
      z
        .object({
          currentPassword: z.string().min(8),
          newPassword: z
            .string()
            .min(8)
            .regex(/[A-Z]/, "대문자가 포함되어야 합니다.")
            .regex(/[^a-zA-Z0-9]/, "특수문자가 포함되어야 합니다."),
          confirmNewPassword: z.string().min(8),
        })
        .refine((data) => data.newPassword === data.confirmNewPassword, {
          message: "새 비밀번호와 확인이 일치하지 않습니다.",
          path: ["confirmNewPassword"],
        }),
    )
    .output(userDTOSchema)
    .mutation(() => {
      throw new Error("Not implemented yet");
    }),
});
