import { z } from "zod";
import { authedProcedure, router } from "#loaders/trpc.loader";

export const subscriptionRouter = router({
  /**
   * 현재 구독 정보 조회
   *
   * @throws UNAUTHORIZED, NOT_FOUND, INTERNAL_SERVER_ERROR
   */
  getCurrent: authedProcedure
    .output(
      z.object({
        name: z.string(), // 요금제 이름
        status: z.enum(["active", "inactive", "canceled", "expired"]),
        billingDate: z.string(), // YYYY-MM-DD
        expirationDate: z.string(), // YYYY-MM-DD
        price: z.number(), // 가격 (단위: 원 또는 USD)
      }),
    )
    .query(() => {
      throw new Error("Not implemented yet");
    }),
});
