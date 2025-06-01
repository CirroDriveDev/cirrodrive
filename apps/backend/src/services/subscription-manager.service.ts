import { inject, injectable } from "inversify";
import type { Logger } from "pino";
import { $Enums } from "@cirrodrive/database/prisma";
import { Symbols } from "#types/symbols";
import { SubscriptionService } from "#services/subscription.service";
import { UserService } from "#services/user.service";
import { PlanService } from "#services/plan.service";
import { dayjs } from "#loaders/dayjs.loader";
import { PaymentService } from "#services/payment.service";
import { BillingService } from "#services/billing.service";
import { Transactional } from "#decorators/transactional";

@injectable()
export class SubscriptionManagerService {
  constructor(
    @inject(SubscriptionService)
    private readonly subscriptionService: SubscriptionService,
    @inject(UserService) private readonly userService: UserService,
    @inject(PlanService) private readonly planService: PlanService,
    @inject(PaymentService) private readonly paymentService: PaymentService,
    @inject(BillingService) private readonly billingService: BillingService,
    @inject(Symbols.Logger)
    private logger: Logger,
  ) {
    this.logger = logger.child({ serviceName: "SubscriptionManagerService" });
  }

  @Transactional()
  public async subscribeToPlan({
    userId,
    planId,
    billingId,
  }: {
    userId: string;
    planId: string;
    billingId: string;
  }) {
    const plan = await this.planService.getPlan(planId);
    const current = await this.subscriptionService.findCurrentByUser(userId); // TRIAL, ACTIVE, etc.
    const user = await this.userService.get({ id: userId });

    const billing = await this.billingService.getById(billingId);

    if (billing.status !== $Enums.BillingStatus.VALID) {
      throw new Error("유효한 결제 수단이 필요합니다.");
    }

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 🔒 중복 구독 방지 (이미 동일 요금제를 ACTIVE 상태로 사용 중)
    if (current?.status === "ACTIVE" && current.planId === planId) {
      throw new Error("이미 이 요금제를 구독 중입니다.");
    }

    // ✅ 현재 구독이 존재하면 무조건 종료 (TRIAL, ACTIVE, UNPAID 등)
    if (current && !["CANCELED", "EXPIRED"].includes(current.status)) {
      await this.subscriptionService.cancel(current.id, {
        reason: "new_subscription",
        retainUntil: false,
      });
    }

    // 🧠 무료 체험 가능 여부 판단
    const isEligibleForTrial = !user.trialUsed && plan.trialDays > 0;
    const trialEndsAt =
      isEligibleForTrial ?
        dayjs().add(plan.trialDays, "day").toDate()
      : undefined;

    // ✅ 구독 만료일 계산
    // plan.durationDays * plan.intervalCount 후
    // 무료 체험이 있는 경우 trialEndsAt 합산
    const expiresAt = dayjs(trialEndsAt)
      .add(plan.durationDays * plan.intervalCount, "day")
      .toDate();

    // 다음 결제일
    // 무료 체험이 있는 경우 trialEndsAt
    // 없으면 plan.durationDays 후
    const nextBillingAt =
      trialEndsAt ?? dayjs().add(plan.durationDays, "day").toDate();

    // ✅ 새 Subscription 생성
    const newSubscription = await this.subscriptionService.create({
      userId,
      planId,
      billingId,
      status: isEligibleForTrial ? "TRIAL" : "ACTIVE",
      startedAt: new Date(),
      expiresAt,
      nextBillingAt,
      trialEndsAt,
    });

    // ✅ 유료 시작 시 즉시 결제
    if (!isEligibleForTrial) {
      await this.paymentService.charge({
        subscriptionId: newSubscription.id,
        userId,
        amount: plan.price,
        orderId: `sub-${newSubscription.id}`,
      });
    }

    // ✅ 사용자 정보 업데이트 (무료 체험 사용 여부)
    if (isEligibleForTrial) {
      await this.userService.updateTrialUsed({ userId });
    }

    await this.userService.updatePlan({
      userId,
      planId: newSubscription.planId,
    });

    // ✅ 구독 생성 로그
    this.logger.info(
      { userId, planId, subscriptionId: newSubscription.id },
      "새 구독이 생성되었습니다.",
    );

    return newSubscription;
  }
}
