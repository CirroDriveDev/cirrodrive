import { router, procedure } from "#loaders/trpc.loader.js";
import { PlanService } from "#services/plan.service.js";
import { container } from "#loaders/inversify.loader.js";

const planService = container.get<PlanService>(PlanService);

export const planRouter = router({
  list: procedure.query(async () => {
    const plans = await planService.getAllPlans();
    return plans;
  }),
});
