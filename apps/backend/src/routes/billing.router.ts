import { z } from "zod";
import { router, procedure } from "@/loaders/trpc.loader";
import { BillingService } from "@/services/billing.service.ts";
import { container } from "@/loaders/inversify.loader.ts";

// @ts-expect-error -- placeholder for the actual BillingService implementation
const _billingService = container.get(BillingService);

export const billingRouter = router({
  confirm: procedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["ACTIVE", "CANCELED", "PENDING"]),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
      }),
    )
    .mutation(() => {
      throw new Error("Not implemented");
    }),
});
