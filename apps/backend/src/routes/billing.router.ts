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
        status: z.enum(["ACTIVE", "CANCELED", "PENDING"]),
      })
    )
    .mutation(async ({ input }) => {
      return billingService.confirmBilling(input.id, input.status);
    }),
});
