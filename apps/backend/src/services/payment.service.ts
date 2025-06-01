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
    const billingList = await this.billingService.listByUserId(userId);

    if (billingList.length === 0) {
      throw new Error(
        "사용자의 결제 정보가 없습니다. 결제 정보를 등록해주세요.",
      );
    }

    // 3. 결제 승인
    for (const billing of billingList) {
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
    }

    await this.subscriptionService.markAsUnpaid(subscriptionId);
  }

  // 결제 내역 조회 (페이징)
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
    const take = limit + 1;
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
      orderBy: { paidAt: "desc" },
      take,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    let nextCursor: string | undefined;
    if (payments.length > limit) {
      const nextItem = payments.pop();
      nextCursor = nextItem?.id;
    }

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
