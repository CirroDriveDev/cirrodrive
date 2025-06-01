import type { TossBilling } from "@cirrodrive/schemas/toss";
import { MethodK2ESchema } from "@cirrodrive/schemas/billing";
import { inject, injectable } from "inversify";
import { $Enums } from "@cirrodrive/database/prisma";
import { PlanService } from "#services/plan.service";
import { SubscriptionRepository } from "#repositories/subscription.repository";
import { CardRepository } from "#repositories/card.repository";

@injectable()
export class SubscriptionService {
  constructor(
    @inject(SubscriptionRepository)
    private readonly subscriptionRepository: SubscriptionRepository,
    @inject(PlanService)
    private readonly planService: PlanService,
    @inject(CardRepository)
    private readonly cardRepository: CardRepository,
  ) {}

  public async getCurrentSubscription(userId: string): Promise<{
    subscription: {
      status: $Enums.BillingStatus;
      startedAt: string;
      expiredAt: string;
      billingKeyLast4?: string;
    };
    plan: {
      name: string;
      id: string;
      price: number;
      currency: string;
      interval: string;
      intervalCount: number;
    };
  } | null> {
    const subscription =
      await this.subscriptionRepository.findActiveByUserId(userId);
    if (!subscription) return null;

    const plan = await this.planService.getPlan(subscription.planId);
    const card = await this.cardRepository.findById(subscription.cardId);

    return {
      plan: {
        id: plan.id,
        name: plan.name,
        interval: plan.interval,
        intervalCount: plan.intervalCount,
        price: plan.price,
        currency: plan.currency,
      },
      subscription: {
        startedAt: subscription.startedAt.toISOString(),
        expiredAt: subscription.nextBillingAt.toISOString(),
        status: subscription.status,
        billingKeyLast4:
          typeof card?.number === "string" ? card.number.slice(-4) : undefined,
      },
    };
  }

  /**
   * 구독 정보를 생성하고 저장합니다.
   *
   * @param billing - TossBilling 객체
   * @param startedAt - 구독 시작일 (기본값: 현재 날짜)
   * @param nextBillingAt - 다음 결제일
   * @param status - 구독 상태 (기본값: INCOMPLETE)
   * @param cardId - 카드 ID
   * @param planId - 요금제 ID
   * @returns 생성된 Subscription 객체
   */
  public async createSubscriptionWithBilling({
    billing,
    startedAt = new Date(),
    nextBillingAt,
    status = $Enums.BillingStatus.INCOMPLETE,
    cardId,
    planId,
  }: {
    billing: TossBilling;
    startedAt?: Date;
    nextBillingAt: Date;
    status?: $Enums.BillingStatus;
    cardId: string;
    planId: string;
  }) {
    const subscription = await this.subscriptionRepository.create({
      mId: billing.mId,
      customerKey: billing.customerKey,
      authenticatedAt: billing.authenticatedAt,
      method: MethodK2ESchema.parse(billing.method),
      billingKey: billing.billingKey,
      startedAt,
      nextBillingAt,
      status,
      cardId,
      planId,
      userId: billing.customerKey,
    });
    return subscription;
  }

  /**
   * 구독의 결제 수단(카드)을 다른 카드로 변경합니다.
   *
   * @param subscriptionId - 변경할 구독 ID
   * @param newCardId - 새 카드 ID
   * @returns 변경된 구독 객체
   */
  public async changeSubscriptionCard({
    subscriptionId,
    newCardId,
  }: {
    subscriptionId: string;
    newCardId: string;
  }) {
    // 구독이 존재하는지 확인
    const subscription =
      await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) throw new Error("Subscription not found");

    // 카드가 존재하는지 확인
    const card = await this.cardRepository.findById(newCardId);
    if (!card) throw new Error("Card not found");

    // 구독의 카드 정보 변경
    const updated = await this.subscriptionRepository.updateCardById(
      subscriptionId,
      newCardId,
    );
    return updated;
  }
}
