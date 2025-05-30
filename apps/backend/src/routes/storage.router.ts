import { z } from "zod";
import { router, authedProcedure } from "#loaders/trpc.loader";

export const storageRouter = router({
  /**
   * 현재 사용자 저장소 상태 조회
   *
   * @throws UNAUTHORIZED, INTERNAL_SERVER_ERROR
   */
  getUsage: authedProcedure
    .output(
      z.object({
        used: z.number(), // 현재 사용량 (bytes)
        quota: z.number(), // 총 할당량 (bytes)
        planId: z.string(), // 현재 요금제 ID
        isNearLimit: z.boolean(), // 사용량이 90% 이상 여부
      }),
    )
    .query(() => {
      throw new Error("Not implemented yet");
    }),
});
