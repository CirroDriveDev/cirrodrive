import { injectable } from "inversify";
import { Prisma, Payment, $Enums } from "@cirrodrive/database";
import { BaseRepository } from "@/repositories/base.repository.ts";

@injectable()
export class PaymentRepository extends BaseRepository {
  // Create
  async create(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment> {
    return this.prisma.payment.create({ data });
  }

  // Read
  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({ where: { id } });
  }
  async listBySubscriptionId(subscriptionId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({ where: { subscriptionId } });
  }

  // Update
  async updateStatusById(
    id: string,
    status: $Enums.PaymentStatus,
  ): Promise<Payment> {
    return this.prisma.payment.update({ where: { id }, data: { status } });
  }

  // Delete
  async deleteById(id: string): Promise<Payment> {
    return this.prisma.payment.delete({ where: { id } });
  }
}
