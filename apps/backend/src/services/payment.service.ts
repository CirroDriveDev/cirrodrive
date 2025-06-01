import { inject, injectable } from "inversify";
import { $Enums } from "@cirrodrive/database/prisma";
import { PaymentRepository } from "#repositories/payment.repository";
import { TossPaymentsService } from "#services/toss-payments.service";
import { UserService } from "#services/user.service";
import { BillingService } from "#services/billing.service";
import { SubscriptionService } from "#services/subscription.service";

@injectable()
export class PaymentService {
  constructor(
    @inject(PaymentRepository)
    private readonly paymentRepository: PaymentRepository,
    @inject(TossPaymentsService)
    private readonly tossPaymentsService: TossPaymentsService,
    @inject(UserService) private readonly userService: UserService,
    @inject(BillingService) private readonly billingService: BillingService,
    @inject(SubscriptionService)
    private readonly subscriptionService: SubscriptionService,
  ) {}

  // 결제 실행 (토스페이먼츠 연동)
  public async charge({
    subscriptionId,
    userId,
    amount,
    orderId,
  }: {
    subscriptionId: string;
    userId: string;
    amount: number;
    orderId: string;
  }) {
    // 1. 사용자 정보 조회
    const user = await this.userService.get({ id: userId });
    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 2. 구독 정보 조회
    const subscription =
      await this.subscriptionService.getByIdWithPlan(subscriptionId);

    // 2. 사용자 결제 정보 조회
    const billing = await this.billingService.getById(subscription.billingId);

    // 3. 결제 승인
    const { billingKey, customerKey } = billing;
    const tossPayment = await this.tossPaymentsService.approveBillingPayment({
      billingKey,
      amount,
      customerKey,
      orderId,
      orderName: subscription.plan.name,
    });

    const payment = await this.paymentRepository.create({
      subscriptionId: subscription.id,
      userId,
      amount,
      orderId: `${orderId}-${billing.id}`,
      status: tossPayment.status as $Enums.PaymentStatus,
      paymentKey: tossPayment.paymentKey,
      currency: tossPayment.currency,
      approvedAt:
        tossPayment.approvedAt ? new Date(tossPayment.approvedAt) : undefined,
      receiptUrl: tossPayment.receipt?.url,
    });

    if (tossPayment.status === "DONE") {
      return payment;
    }

    await this.subscriptionService.markAsUnpaid(subscriptionId);
  }

  // 결제 내역 조회 (페이징)
  public async getPaymentHistory(params: {
    userId: string;
    limit: number;
    cursor?: string;
  }) {
    const { userId, limit, cursor } = params;
    const take = limit + 1;
    const payments = await this.paymentRepository.listByUserId(userId, {
      pageSize: take,
      cursor,
    });

    let nextCursor: string | undefined;
    const items = payments;
    if (payments.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return { payments, nextCursor };
  }
}
