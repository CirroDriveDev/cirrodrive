import { planDTOSchema } from "@cirrodrive/schemas/billing";
import { z } from "zod";
import { router, procedure } from "#loaders/trpc.loader";
import { PlanService } from "#services/plan.service";
import { container } from "#loaders/inversify.loader";

const planService = container.get<PlanService>(PlanService);

export const planRouter = router({
  get: procedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .output(planDTOSchema)
    .query(async ({ input }) => {
      const { id } = input;
      const plan = await planService.getPlan(id);
      if (!plan) {
        throw new Error(`Plan with ID ${id} not found`);
      }
      return plan;
    }),

  list: procedure.output(z.array(planDTOSchema)).query(async () => {
    const plans = await planService.getAllPlans();
    return plans;
  }),
});
