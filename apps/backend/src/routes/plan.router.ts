import { router, procedure } from "@/loaders/trpc.loader";
import { PlanService } from "@/services/plan.service.ts";
import { prisma } from "@/loaders/prisma.loader.ts";  

const planService = new PlanService(prisma.plan); 

export const planRouter = router({
  list: procedure.query(async () => {
    const plans = await planService.getAllPlans();
    return plans;
  }),
});
