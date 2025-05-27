import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import { $Enums } from "@cirrodrive/database/prisma";
import { Symbols } from "#types/symbols";
import { PlanRepository } from "#repositories/plan.repository";
import { UserRepository } from "#repositories/user.repository";

@injectable()
export class PlanService {
  constructor(
    @inject(Symbols.Logger)
    private logger: Logger,
    @inject(PlanRepository)
    private planRepotitory: PlanRepository,
    @inject(UserRepository)
    private userRepository: UserRepository,
  ) {
    this.logger = logger.child({ prefix: "PlanService" });
  }

  public async getAllPlans() {
    this.logger.debug("Fetching all plans");
    return await this.planRepotitory.listAll();
  }

  public async getPlan(planId: string) {
    this.logger.debug(`Fetching plan with ID: ${planId}`);
    return await this.planRepotitory.getById(planId);
  }

  public async getCurrentPlanByUserId(userId: string) {
    this.logger.debug(`Fetching current plan for user ID: ${userId}`);
    return await this.userRepository.getCurrentPlanByUserId(userId);
  }

  public async getDefaultPlan() {
    this.logger.debug("Fetching default plan");
    return await this.planRepotitory.getByName("Free");
  }

  /**
   * 주어진 요금제 정보와 시작일을 기반으로 다음 결제일을 계산합니다.
   *
   * @param interval - 결제 주기 (DAY, WEEK, MONTH, YEAR)
   * @param intervalCount - 결제 주기 수 (예: 1개월, 2개월 등)
   * @param from - 시작일 (기본값: 현재 날짜)
   * @returns 계산된 다음 결제일(Date)
   */
  public calculateNextBillingAt({
    interval,
    intervalCount,
    from = new Date(),
  }: {
    interval: $Enums.PlanInterval;
    intervalCount: number;
    from?: Date;
  }): Date {
    const date = new Date(from);
    if (interval === $Enums.PlanInterval.DAY) {
      date.setDate(date.getDate() + intervalCount);
    } else if (interval === $Enums.PlanInterval.WEEK) {
      date.setDate(date.getDate() + intervalCount * 7);
    } else if (interval === $Enums.PlanInterval.MONTH) {
      date.setMonth(date.getMonth() + intervalCount);
    } else if (interval === $Enums.PlanInterval.YEAR) {
      date.setFullYear(date.getFullYear() + intervalCount);
    }
    return date;
  }
}
