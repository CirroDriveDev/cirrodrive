import { injectable } from "inversify";
import { Prisma, type Payment } from "@cirrodrive/database/prisma";
import type { TossPayment } from "@cirrodrive/schemas/toss";
import { BaseRepository } from "#repositories/base.repository";

@injectable()
export class PaymentRepository extends BaseRepository {
  // Create
  async create(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment> {
    return await this.prisma.payment.create({ data });
  }

  /**
   * Toss Payments API에서 받아온 결제 객체를 저장합니다.
   *
   * @param payment - TossPaymentsService.approveBillingPayment에서 반환된
   *   객체(TossPayment 타입)
   * @param userId - 결제한 사용자 ID
   * @param subscriptionId - 결제와 연결된 구독 ID
   * @param planId - 결제와 연결된 요금제 ID
   * @returns 생성된 Payment 객체
   */
  async createFromPayment(
    payment: TossPayment,
    userId: string,
    subscriptionId: string,
    planId: string,
  ): Promise<Payment> {
    return await this.prisma.payment.create({
      data: {
        ...payment,
        userId,
        subscriptionId,
        planId,
        card: payment.card ?? undefined,
        easyPay: payment.easyPay ?? undefined,
        receipt: payment.receipt ?? undefined,
        checkout: payment.checkout ?? undefined,
        metadata: payment.metadata ? (payment.metadata as object) : undefined,
      },
    });
  }

  // Read
  async findById(id: string): Promise<Payment | null> {
    return await this.prisma.payment.findUnique({ where: { id } });
  }

  async findByPaymentKey(paymentKey: string): Promise<Payment | null> {
    return await this.prisma.payment.findUnique({ where: { paymentKey } });
  }

  async listByUserId(userId: string): Promise<Payment[]> {
    return await this.prisma.payment.findMany({ where: { userId } });
  }

  async listBySubscriptionId(subscriptionId: string): Promise<Payment[]> {
    return await this.prisma.payment.findMany({ where: { subscriptionId } });
  }

  async listByPlanId(planId: string): Promise<Payment[]> {
    return await this.prisma.payment.findMany({ where: { planId } });
  }

  async listAll(): Promise<Payment[]> {
    return await this.prisma.payment.findMany();
  }

  // Delete
  async deleteById(id: string): Promise<Payment> {
    return await this.prisma.payment.delete({ where: { id } });
  }
}
