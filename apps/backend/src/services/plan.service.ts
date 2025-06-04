import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import { $Enums } from "@cirrodrive/database/prisma";
import { TRPCError } from "@trpc/server";
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
    const plans = await this.planRepotitory.listAll();
    return plans.map(plan => ({
      ...plan,
      storageLimit: Number(plan.storageLimit),
    }));
  }

  public async getPlan(planId: string) {
    this.logger.debug(`Fetching plan with ID: ${planId}`);
    const plan = await this.planRepotitory.getById(planId);
    return {
      ...plan,
      storageLimit: Number(plan.storageLimit),
    };
  }

  public async getCurrentPlanByUserId(userId: string) {
    this.logger.debug(`Fetching current plan for user ID: ${userId}`);
    const plan = await this.userRepository.getCurrentPlanByUserId(userId);
    return {
      ...plan,
      storageLimit: Number(plan.storageLimit),
    };
  }

  public async getDefaultPlan() {
    this.logger.debug("Fetching default plan");
    const plans = await this.planRepotitory.listByName("Free");
    if (plans.length === 0) {
      this.logger.error("Default plan not found");
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Default plan not found",
      });
    }

    if (plans.length > 1) {
      this.logger.warn("Multiple default plans found, returning the first one");
      this.logger.warn(
        "This may indicate a data integrity issue. Please check your database.",
      );
      this.logger.warn(
        "If you are running in development mode, consider resetting your database.",
      );
      this.logger.warn(
        "If you are running in production mode, please contact support.",
      );
    }

    return {
      ...plans[0],
      storageLimit: Number(plans[0].storageLimit),
    };
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
    trialPeriodDays,
    from = new Date(),
  }: {
    interval: $Enums.Interval;
    intervalCount: number;
    trialPeriodDays: number;
    from?: Date;
  }): Date {
    const date = new Date(from);
    if (interval === $Enums.Interval.MONTHLY) {
      date.setMonth(date.getMonth() + intervalCount);
    } else if (interval === $Enums.Interval.YEARLY) {
      date.setFullYear(date.getFullYear() + intervalCount);
    }
    date.setDate(date.getDate() + trialPeriodDays);
    return date;
  }
  /**
   * 요금제별 할당 용량 정보를 조회합니다.
   *
   * @param planId - 조회할 요금제 ID
   * @returns 요금제 ID, 할당 용량(예: MB), 설명(선택적)
   */
  public async getPlanQuota(planId: string): Promise<{
    planId: string;
    quota?: number;
    description?: string;
  }> {
    try {
      const plan = await this.getPlan(planId);

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "요금제를 찾을 수 없습니다.",
        });
      }

      return {
        planId: plan.id,
        description: plan.description ?? undefined,
        quota: plan.storageLimit ? Number(plan.storageLimit) : undefined, // BigInt를 number로 변환
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "요금제 정보를 조회하는 중 오류가 발생했습니다.",
        cause: error,
      });
    }
  }
}
