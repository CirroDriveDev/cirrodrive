import { injectable } from "inversify";
import { type Plan } from "@cirrodrive/database";
import { BaseRepository } from "@/repositories/base.repository.ts";

@injectable()
export class PlanRepository extends BaseRepository {
  // create

  // read
  public async listAllPlans(): Promise<Plan[]> {
    return this.prisma.plan.findMany();
  }

  // update

  // delete
}
