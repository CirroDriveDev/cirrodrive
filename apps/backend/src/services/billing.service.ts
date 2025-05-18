import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import type { TossBilling } from "@cirrodrive/schemas";
import { $Enums, Card } from "@cirrodrive/database";
import {
  MethodK2ESchema,
  CardTypeK2ESchema,
  OwnerTypeK2ESchema,
} from "@cirrodrive/schemas";
import { TossPaymentsService } from "@/services/toss-payments-service.ts";
import { SubscriptionRepository } from "@/repositories/subscription.repository.ts";
import { Symbols } from "@/types/symbols.ts";
import { CardRepository } from "@/repositories/card.repository.ts";
import { PlanService } from "@/services/plan.service.ts";
import { Transactional } from "@/decorators/transactional.ts";
import { ExternalPaymentError } from "@/errors/error-classes.ts";

@injectable()
export class BillingService {
  constructor(
    @inject(Symbols.Logger) private readonly logger: Logger,
    @inject(TossPaymentsService) private readonly toss: TossPaymentsService,
    @inject(PlanService) private readonly planService: PlanService,
    @inject(SubscriptionRepository)
    private readonly subscriptionRepository: SubscriptionRepository,
    @inject(CardRepository)
    private readonly cardRepository: CardRepository,
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
      const card = await this.createCardFromBilling(billing);

      // 구독 정보 생성 및 저장
      await this.createSubscriptionWithBilling({
        billing,
        nextBillingAt: this.planService.calculateNextBillingAt({
          interval: plan.interval,
          intervalCount: plan.intervalCount,
        }),
        cardId: card.id,
        planId,
      });

      // TODO: 결제 시도
      // TODO: 결제 성공 시 구독 상태를 ACTIVE로 변경

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
   * Billing 객체에서 카드 정보를 추출하여 카드 객체를 생성합니다.
   *
   * @param billing - TossBilling 객체
   * @returns - 생성된 카드 객체
   */
  @Transactional()
  private async createCardFromBilling(billing: TossBilling): Promise<Card> {
    // CardRepository를 통해 카드 정보 저장
    const card = await this.cardRepository.create({
      userId: billing.customerKey,
      acquirerCode: billing.card.acquirerCode,
      cardCompany: billing.cardCompany,
      cardType: CardTypeK2ESchema.parse(billing.card.cardType),
      issuerCode: billing.card.issuerCode,
      number: billing.card.number,
      ownerType: OwnerTypeK2ESchema.parse(billing.card.ownerType),
    });
    return card;
  }
}
