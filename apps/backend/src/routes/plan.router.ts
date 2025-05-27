import { router, procedure } from "#loaders/trpc.loader";
import { PlanService } from "#services/plan.service";
import { container } from "#loaders/inversify.loader";

const planService = container.get<PlanService>(PlanService);

export const planRouter = router({
  list: procedure.query(async () => {
    const plans = await planService.getAllPlans();
    return plans;
  }),
});
