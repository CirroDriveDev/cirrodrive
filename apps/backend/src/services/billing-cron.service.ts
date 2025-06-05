import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import type { Subscription, Plan, Billing, User } from "@cirrodrive/database/prisma";
import { $Enums } from "@cirrodrive/database/prisma";
import { Symbols } from "#types/symbols";
import { SubscriptionRepository } from "#repositories/subscription.repository";
import { PaymentService } from "#services/payment.service";
import { SubscriptionService } from "#services/subscription.service";
import { dayjs } from "#loaders/dayjs.loader";
import { Transactional } from "#decorators/transactional";

type SubscriptionWithRelations = Subscription & {
  plan: Plan;
  billing: Billing;
  user: User;
};

@injectable()
export class BillingCronService {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(SubscriptionRepository)
    private readonly subscriptionRepository: SubscriptionRepository,
    @inject(PaymentService) private readonly paymentService: PaymentService,
    @inject(SubscriptionService)
    private readonly subscriptionService: SubscriptionService,
  ) {
    this.logger = logger.child({ serviceName: "BillingCronService" });
  }

  public async processPendingBilling(): Promise<void> {
    this.logger.info("Starting periodic billing process");

    try {
      const currentDate = new Date();
      const subscriptionsDue =
        await this.subscriptionRepository.findSubscriptionsDueForBilling(
          currentDate,
        );

      this.logger.info(
        { count: subscriptionsDue.length },
        "Found subscriptions due for billing",
      );

      for (const subscription of subscriptionsDue) {
        await this.processSubscriptionBilling(subscription);
      }

      this.logger.info("Periodic billing process completed successfully");
    } catch (error) {
      this.logger.error(
        { err: error },
        "Error occurred during periodic billing process",
      );
      throw error;
    }
  }

  @Transactional()
  private async processSubscriptionBilling(subscription: SubscriptionWithRelations): Promise<void> {
    const { id, userId, plan, billing, status, trialEndsAt } = subscription;

    try {
      this.logger.info(
        { subscriptionId: id, userId, planId: plan.id },
        "Processing billing for subscription",
      );

      if (status === "TRIAL" && trialEndsAt && dayjs().isBefore(trialEndsAt)) {
        this.logger.info(
          { subscriptionId: id },
          "Subscription is still in trial period, skipping billing",
        );
        return;
      }

      if (!billing || billing.status !== $Enums.BillingStatus.VALID) {
        this.logger.warn(
          { subscriptionId: id, billingStatus: billing?.status },
          "Invalid billing information, marking subscription as unpaid",
        );
        await this.subscriptionService.markAsUnpaid(id);
        return;
      }

      if (status === "TRIAL") {
        await this.handleTrialToActiveTransition(subscription);
      } else {
        await this.handleRegularBilling(subscription);
      }
    } catch (error) {
      this.logger.error(
        { err: error, subscriptionId: id },
        "Failed to process billing for subscription",
      );

      try {
        await this.subscriptionService.markAsUnpaid(id);
        this.logger.info(
          { subscriptionId: id },
          "Marked subscription as unpaid due to billing failure",
        );
      } catch (markUnpaidError) {
        this.logger.error(
          { err: markUnpaidError, subscriptionId: id },
          "Failed to mark subscription as unpaid",
        );
      }
    }
  }

  @Transactional()
  private async handleTrialToActiveTransition(
    subscription: SubscriptionWithRelations,
  ): Promise<void> {
    const { id, userId, plan } = subscription;

    this.logger.info(
      { subscriptionId: id },
      "Processing trial to active transition",
    );

    const orderId = `sub-${id}-trial-end-${Date.now()}`;

    await this.paymentService.charge({
      subscriptionId: id,
      userId,
      amount: plan.price,
      orderId,
    });

    await this.subscriptionRepository.updateById(id, {
      status: "ACTIVE",
      nextBillingAt: dayjs()
        .add(plan.durationDays * plan.intervalCount, "day")
        .toDate(),
    });

    this.logger.info(
      { subscriptionId: id },
      "Successfully transitioned subscription from trial to active",
    );
  }

  @Transactional()
  private async handleRegularBilling(subscription: SubscriptionWithRelations): Promise<void> {
    const { id, userId, plan } = subscription;

    this.logger.info(
      { subscriptionId: id },
      "Processing regular billing payment",
    );

    const orderId = `sub-${id}-billing-${Date.now()}`;

    await this.paymentService.charge({
      subscriptionId: id,
      userId,
      amount: plan.price,
      orderId,
    });

    await this.subscriptionRepository.updateById(id, {
      nextBillingAt: dayjs()
        .add(plan.durationDays * plan.intervalCount, "day")
        .toDate(),
    });

    this.logger.info(
      { subscriptionId: id },
      "Successfully processed regular billing payment",
    );
  }
}