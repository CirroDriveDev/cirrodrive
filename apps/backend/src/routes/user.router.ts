import { userDTOSchema, userSchema } from "@cirrodrive/schemas/user";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { container } from "#loaders/inversify.loader";
import { UserService } from "#services/user.service";
import { logger } from "#loaders/logger.loader";
import { router, procedure, authedProcedure } from "#loaders/trpc.loader";

const userService = container.get<UserService>(UserService);
const passwordSchema = z.string()
  .min(8)
  .regex(/[A-Z]/, "영어 대문자를 포함해야 합니다.")
  .regex(/[0-9]/, "숫자를 포함해야 합니다.")
  .regex(/[\W_]/, "특수문자를 포함해야 합니다.");

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
  changePassword: procedure
  .input(
    z.object({
      currentPassword: z.string().min(8),  // 현재 비밀번호, 최소 8자
      newPassword: passwordSchema,         // 새 비밀번호, passwordSchema로 유효성 검사
    }),
  )
  .output(userDTOSchema)                   // 반환값 스키마 (유저 DTO)
  .mutation(async ({ input, ctx }) => {
    logger.info({ requestId: ctx.req.id }, "user.changePassword 요청 시작");

    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "로그인이 필요합니다.",
      });
    }

    try {
      const { currentPassword, newPassword } = input;

      // 서비스에서 비밀번호 변경 처리
      const user = await userService.changePassword({
        userId: ctx.user.id,
        currentPassword,
        newPassword,
      });

      logger.info({ requestId: ctx.req.id }, "user.changePassword 요청 성공");

      return user;
    } catch (error) {
      logger.error(
        { requestId: ctx.req.id, error },
        "user.changePassword 요청 실패",
      );

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "현재 비밀번호가 올바르지 않습니다.",
      });
    }
  }),
});
