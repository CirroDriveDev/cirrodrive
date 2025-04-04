import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, procedure } from "@/loaders/trpc.ts";

// 기본 admin 정보 스키마
const adminInputSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
  pricingPlan: z.enum(["basic", "premium", "enterprise"]), // 요금제
  profileImageUrl: z.string().nullable(), // 프로필 이미지 URL
  usedStorage: z.number().default(0), // 사용한 저장 용량
  customFields: z.record(z.string()).optional(), // 유동적인 커스텀 필드 (키-값 쌍)
});

export const adminRouter = router({
  create: procedure
    .input(adminInputSchema) // 유동적인 커스텀 필드 포함
    .mutation(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Admin creation service not implemented yet.",
      });
    }),

  update: procedure
    .input(adminInputSchema) // 유동적인 커스텀 필드 포함
    .mutation(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Admin update service not implemented yet.",
      });
    }),

  delete: procedure
    .input(z.number()) // id만 받음
    .mutation(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Admin delete service not implemented yet.",
      });
    }),

  list: procedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        offset: z.number().optional().default(0),
      }),
    )
    .query(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Admin list service not implemented yet.",
      });
    }),

  get: procedure
    .input(z.number()) // id만 받음
    .query(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Admin get service not implemented yet.",
      });
    }),
});
