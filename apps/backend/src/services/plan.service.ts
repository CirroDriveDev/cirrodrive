// plan.service.ts
import { injectable, inject } from "inversify";
import type { Prisma, Plan } from "@cirrodrive/database";
import { Symbols } from "@/types/symbols.ts";

@injectable()
export class PlanService {
  constructor(
    private logger: Logger,
    private planModel: Prisma.PlanDelegate,
  ) {
    this.logger = logger.child({ prefix: "PlanService" });
  }

  public async getAllPlans() {
    return this.planModel.findMany();
  }
}
