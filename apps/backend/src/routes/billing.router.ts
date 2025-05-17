import { z } from "zod";
import { router, procedure } from "@/loaders/trpc.loader";
import { BillingService } from "@/services/billing.service";
import { BillingAgreementRepository } from "@/repositories/billing-agreement.repository";

const billingService = new BillingService(new BillingAgreementRepository());

export const billingRouter = router({
  confirm: procedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["ACTIVE", "CANCELED", "PENDING"]), // 여기까지만!
      })
    )
    .mutation(async ({ input }) => {
      // status는 문자열 그대로 서비스에 넘김
      return await billingService.confirmBilling(input.id, input.status);
    }),
});
