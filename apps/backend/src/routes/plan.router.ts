import { router, procedure } from "@/loaders/trpc.loader.ts";
import { PlanService } from "@/services/plan.service.ts";
import { container } from "@/loaders/inversify.loader.ts";

const planService = container.get<PlanService>(PlanService);

export const planRouter = router({
  list: procedure.query(async () => {
    const plans = await planService.getAllPlans();
    return plans;
  }),
});
