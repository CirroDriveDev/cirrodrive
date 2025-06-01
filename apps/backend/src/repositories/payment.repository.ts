import { injectable } from "inversify";
import { Prisma, Payment } from "@cirrodrive/database/prisma";
import { BaseRepository } from "#repositories/base.repository";

@injectable()
export class PaymentRepository extends BaseRepository {
  async create(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment> {
    return this.prisma.payment.create({ data });
  }

  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({ where: { id } });
  }

  async findAllByUserId(userId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({ where: { userId } });
  }

  async findAllBySubscriptionId(subscriptionId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({ where: { subscriptionId } });
  }

  async findAll(): Promise<Payment[]> {
    return this.prisma.payment.findMany();
  }

  async updateById(
    id: string,
    data: Prisma.PaymentUpdateInput,
  ): Promise<Payment> {
    return this.prisma.payment.update({ where: { id }, data });
  }

  async deleteById(id: string): Promise<Payment> {
    return this.prisma.payment.delete({ where: { id } });
  }
}
