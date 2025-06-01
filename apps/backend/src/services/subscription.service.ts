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
}
