import { z } from "zod";
import { paymentDTOSchema } from "@cirrodrive/schemas/billing";
import { router, authedProcedure } from "#loaders/trpc.loader";
import { container } from "#loaders/inversify.loader";
import { PaymentService } from "#services/payment.service";

const paymentService = container.get(PaymentService);

export const paymentRouter = router({
  /**
   * 결제 내역 조회 (페이징 지원)
   *
   * 사용자의 결제 내역을 조회합니다. 페이징을 위해 limit 및 cursor를 사용할 수 있습니다. 결제 내역이 없을 경우
   * payments는 빈 배열로 반환되며, 에러는 발생하지 않습니다. 클라이언트는 빈 배열 여부로 결제 내역 유무를 판단해야 합니다.
   *
   * @param input.limit - 조회 개수 (기본값: 20, 최대: 100)
   * @param input.cursor - 페이징 커서 (옵션)
   * @returns 결제 내역 배열 및 다음 커서 (더 불러올 내역이 없으면 nextCursor는 null)
   */
  getPayment: authedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).optional().default(20),
        cursor: z.string().optional(),
      }),
    )
    .output(
      z.object({
        payments: z.array(paymentDTOSchema),
        nextCursor: z.string().nullable(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { limit, cursor } = input;

      const { payments, nextCursor } = await paymentService.getPaymentHistory({
        userId,
        limit,
        cursor,
      });

      return {
        payments: payments ?? [],
        nextCursor: nextCursor ?? null,
      };
    }),
});
