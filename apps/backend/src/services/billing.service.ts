import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import { $Enums } from "@cirrodrive/database/prisma";
import type { TossBilling } from "@cirrodrive/schemas/toss";
import { MethodK2ESchema } from "@cirrodrive/schemas/billing";
import { TossPaymentsService } from "#services/toss-payments.service";
import { SubscriptionRepository } from "#repositories/subscription.repository";
import { Symbols } from "#types/symbols";
import { PlanService } from "#services/plan.service";
import { Transactional } from "#decorators/transactional";
import { ExternalPaymentError } from "#errors/error-classes";
import { PaymentRepository } from "#repositories/payment.repository";
import { UserService } from "#services/user.service";
import { CardService } from "#services/card.service";

@injectable()
export class BillingService {
  constructor(
    @inject(Symbols.Logger) private readonly logger: Logger,
    @inject(UserService) private readonly userService: UserService,
    @inject(TossPaymentsService) private readonly toss: TossPaymentsService,
    @inject(PlanService) private readonly planService: PlanService,
    @inject(SubscriptionRepository)
    private readonly subscriptionRepository: SubscriptionRepository,
    @inject(PaymentRepository)
    private readonly paymentRepository: PaymentRepository,
    @inject(CardService)
    private readonly cardService: CardService,
  ) {
    this.logger = logger.child({ serviceName: "BillingService" });
  }

  /**
   * 구독 결제를 위한 Toss Billing Key를 발급받고, 카드 정보를 생성하여 구독을 등록합니다.
   *
   * @param planId - 요금제 ID
   * @param authKey - 인증 키
   * @param customerKey - 고객 키
   * @returns - 결제 성공 여부
   */
  @Transactional()
  public async confirmAgreement({
    planId,
    authKey,
    customerKey,
  }: {
    planId: string;
    authKey: string;
    customerKey: string;
  }): Promise<{ success: true }> {
    try {
      // 요금제 정보 조회
      const plan = await this.planService.getPlan(planId);

      // Toss에서 Billing Key 발급
      const billing = await this.toss.issueBillingKey({ authKey, customerKey });

      // Billing 정보로 카드 생성
      const card = await this.cardService.createCardFromBilling(billing);

      const previousSubscription =
        await this.subscriptionRepository.findActiveByUserId(
          billing.customerKey,
        );

      if (previousSubscription) {
        // 기존 구독이 있는 경우, 구독 상태를 CANCELED로 변경
        await this.subscriptionRepository.updateStatusById(
          previousSubscription.id,
          $Enums.BillingStatus.CANCELED,
        );
      }

      // 구독 정보 생성 및 저장
      const subscription = await this.createSubscriptionWithBilling({
        billing,
        nextBillingAt: this.planService.calculateNextBillingAt({
          interval: plan.interval,
          intervalCount: plan.intervalCount,
          trialPeriodDays: plan.trialPeriodDays ?? 0,
        }),
        cardId: card.id,
        planId,
      });

      if (plan.trialPeriodDays) {
        // 무료 체험 기간이 있는 경우, 구독 상태를 TRIAL로 설정
        await this.subscriptionRepository.updateStatusById(
          subscription.id,
          $Enums.BillingStatus.TRIALING,
        );
      } else {
        await this.approveAndRecordPayment({
          billingKey: billing.billingKey,
          amount: plan.price,
          customerKey: billing.customerKey,
          orderId: `${planId}-${Date.now()}`,
          orderName: plan.name,
          subscriptionId: subscription.id,
          planId,
        });
      }

      await this.userService.updatePlan({
        userId: billing.customerKey,
        planId,
      });

      return { success: true };
    } catch (error) {
      // 에러 발생 시 로깅
      this.logger.error(
        { err: error, authKey, customerKey },
        "Failed to confirm agreement",
      );
      throw new ExternalPaymentError(
        error instanceof Error ?
          error.message
        : "Unknown external payment error",
        { cause: error, authKey, customerKey },
      );
    }
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
  @Transactional()
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
    // SubscriptionRepository를 통해 구독 정보 저장
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
   * 결제 승인 및 결제 정보 저장, 구독 상태 갱신을 처리합니다.
   *
   * @param params.billingKey - 결제용 Billing Key
   * @param params.amount - 결제 금액
   * @param params.customerKey - 고객 Key
   * @param params.orderId - 주문 ID
   * @param params.orderName - 주문명
   * @param params.subscriptionId - 구독 ID
   * @param params.planId - 요금제 ID
   */
  private async approveAndRecordPayment({
    billingKey,
    amount,
    customerKey,
    orderId,
    orderName,
    subscriptionId,
    planId,
  }: {
    billingKey: string;
    amount: number;
    customerKey: string;
    orderId: string;
    orderName: string;
    subscriptionId: string;
    planId: string;
  }) {
    try {
      const payment = await this.toss.approveBillingPayment({
        billingKey,
        amount,
        customerKey,
        orderId,
        orderName,
      });

      // 결제 정보 저장
      await this.paymentRepository.createFromPayment(
        payment,
        customerKey,
        subscriptionId,
        planId,
      );

      // 결제 성공 시 구독 상태를 ACTIVE로 변경
      await this.subscriptionRepository.updateStatusById(
        subscriptionId,
        $Enums.BillingStatus.ACTIVE,
      );
    } catch (paymentError) {
      this.logger.error(
        { err: paymentError, planId, customerKey },
        "Payment attempt failed",
      );
      throw new ExternalPaymentError(
        paymentError instanceof Error ?
          paymentError.message
        : "Unknown payment error",
        { cause: paymentError, planId, customerKey },
      );
    }
  }
}
