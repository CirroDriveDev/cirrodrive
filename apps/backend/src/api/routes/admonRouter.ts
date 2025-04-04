import { userDTOSchema, userSchema } from "@cirrodrive/schemas"; // 그대로 사용
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { container } from "@/loaders/inversify.ts";
import { AdminService } from "@/services/adminService.ts";
import { logger } from "@/loaders/logger.ts";
import { router, procedure } from "@/loaders/trpc.ts";

const adminService = container.get<AdminService>(AdminService);

export const adminRouter = router({
  create: procedure
    .input(
      userSchema // userSchema 그대로 사용
        .pick({
          username: true,
          password: true,
          email: true,
        })
        .extend({
          token: z.string(), // 이메일 인증 토큰
        }),
    )
    .output(userDTOSchema) // userDTOSchema 그대로 사용
    .mutation(async ({ input, ctx }) => {
      logger.info({ requestId: ctx.req.id }, "admin.create 요청 시작");

      // ctx.user 객체에서 role을 확인하여 관리자인지 여부를 판단
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "관리자만 이 작업을 수행할 수 있습니다.",
        });
      }

      if (await adminService.existsByUsername({ username: input.username })) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "이미 사용 중인 사용자 이름입니다.",
        });
      }

      if (await adminService.existsByEmail({ email: input.email })) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "이미 사용 중인 이메일 주소입니다.",
        });
      }

      try {
        const admin = await adminService.create({
          username: input.username,
          password: input.password,
          email: input.email,
          token: input.token, // 추가
        });

        logger.info({ requestId: ctx.req.id }, "admin.create 요청 성공");

        return admin;
      } catch (error) {
        logger.error(
          { requestId: ctx.req.id, error },
          "admin.create 요청 실패",
        );

        throw Error("알 수 없는 오류가 발생했습니다.");
      }
    }),
});
