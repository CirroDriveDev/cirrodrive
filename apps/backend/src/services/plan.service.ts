// plan.service.ts
import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import { Symbols } from "@/types/symbols.ts";
import { PlanRepository } from "@/repositories/plan.repository.ts";

@injectable()
export class PlanService {
  constructor(
    @inject(Symbols.Logger)
    private logger: Logger,
    @inject(PlanRepository)
    private planRepotitory: PlanRepository,
  ) {
    this.logger = logger.child({ prefix: "PlanService" });
  }

  public async getAllPlans() {
    this.logger.debug("Fetching all plans");
    return this.planRepotitory.listAll();
  }
}
