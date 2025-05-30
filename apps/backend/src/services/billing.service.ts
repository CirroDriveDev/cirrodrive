import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import { $Enums, type Card } from "@cirrodrive/database/prisma";
import type { TossBilling } from "@cirrodrive/schemas/toss";
import {
  CardTypeK2ESchema,
  MethodK2ESchema,
  OwnerTypeK2ESchema,
} from "@cirrodrive/schemas/billing";
import { TossPaymentsService } from "#services/toss-payments.service";
import { SubscriptionRepository } from "#repositories/subscription.repository";
import { Symbols } from "#types/symbols";
import { CardRepository } from "#repositories/card.repository";
import { PlanService } from "#services/plan.service";
import { Transactional } from "#decorators/transactional";
import { ExternalPaymentError } from "#errors/error-classes";
import { PaymentRepository } from "#repositories/payment.repository";

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
    @inject(PaymentRepository)
    private readonly paymentRepository: PaymentRepository,
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
        }),
        cardId: card.id,
        planId,
      });

      // 결제 시도
      try {
        const payment = await this.toss.approveBillingPayment({
          billingKey: billing.billingKey,
          amount: plan.price,
          customerKey: billing.customerKey,
          orderId: `${planId}-${Date.now()}`,
          orderName: plan.name,
        });

        // 결제 정보 저장
        await this.paymentRepository.createFromPayment(
          payment,
          billing.customerKey,
          subscription.id,
          planId,
        );

        // 결제 성공 시 구독 상태를 ACTIVE로 변경
        await this.subscriptionRepository.updateStatusById(
          subscription.id,
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
  /**
   * 현재 사용자 구독 정보를 조회합니다.
   *
   * @param userId - 사용자 ID
   * @returns 구독 및 요금제 정보 또는 null
   */
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
        expiredAt: subscription.nextBillingAt.toISOString(), // nextBillingAt → expiredAt
        status: subscription.status,
        billingKeyLast4:
          typeof card?.number === "string" ? card.number.slice(-4) : undefined,
      },
    };
  }
    /**
   * 사용자 결제 내역을 조회합니다.
   *
   * @param params - 조회 파라미터
   *   - userId: 조회할 사용자 ID
   *   - limit: 한 번에 조회할 최대 결제 내역 개수
   *   - cursor: 다음 페이지 조회를 위한 커서 ID (옵션)
   * @returns 결제 내역 리스트와 다음 페이지 커서
   *   - payments: 결제 내역 배열
   *     - id: 결제 ID
   *     - amount: 결제 금액
   *     - currency: 통화 단위
   *     - status: 결제 상태 ("paid" | "failed" | "pending")
   *     - paidAt: 결제 완료 시각 (ISO 문자열)
   *     - method: 결제 수단
   *     - description: 결제 설명 (없을 수도 있음)
   *   - nextCursor: 다음 페이지 조회에 사용할 커서 ID (있으면 반환)
   */
  public async getPaymentHistory(params: {
    userId: string;
    limit: number;
    cursor?: string;
  }): Promise<{
    payments: {
      id: string;
      amount: number;
      currency: string;
      status: "paid" | "failed" | "pending";
      paidAt: string;
      method: string;
      description: string | null;
    }[];
    nextCursor?: string;
  }> {
    const { userId, limit, cursor } = params;
    const take = limit + 1; // 다음 페이지 존재 확인용 한 개 더 조회

    // 결제 내역을 페이징하여 조회
    const payments = await (
      this.paymentRepository as unknown as {
        findMany: (args: {
          where: { userId: string };
          orderBy: { paidAt: "desc" };
          take: number;
          cursor?: { id: string };
          skip?: number;
        }) => Promise<
          {
            id: string;
            amount: number;
            currency: string;
            status: string;
            paidAt: Date | string;
            method: string;
            description: string | null;
          }[]
        >;
      }
    ).findMany({
      where: { userId },
      orderBy: { paidAt: "desc" }, // 최신 결제 내역부터
      take,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0, // 커서가 있으면 해당 항목은 제외
    });

    let nextCursor: string | undefined;
    if (payments.length > limit) {
      const nextItem = payments.pop(); // 한 개 초과시 다음 페이지 커서로 설정
      nextCursor = nextItem?.id;
    }

    // 응답 형식에 맞게 데이터 가공 (paidAt을 ISO 문자열로 변환)
    const result = payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status as "paid" | "failed" | "pending",
      paidAt:
        p.paidAt instanceof Date ? p.paidAt.toISOString() : String(p.paidAt),
      method: p.method,
      description: p.description,
    }));

    return { payments: result, nextCursor };
  }

}
