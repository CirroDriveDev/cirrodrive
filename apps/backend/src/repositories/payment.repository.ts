import { injectable } from "inversify";
import { Prisma, Payment } from "@cirrodrive/database";
import { BaseRepository } from "@/repositories/base.repository.ts";

@injectable()
export class PaymentRepository extends BaseRepository {
  // Create
  async create(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment> {
    return await this.prisma.payment.create({ data });
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
