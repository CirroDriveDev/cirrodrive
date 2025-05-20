import { injectable } from "inversify";
import { Prisma, type Transaction, $Enums } from "@cirrodrive/database/prisma";
import { BaseRepository } from "#repositories/base.repository.js";

@injectable()
export class TransactionRepository extends BaseRepository {
  // Create
  async create(
    data: Prisma.TransactionUncheckedCreateInput,
  ): Promise<Transaction> {
    return this.prisma.transaction.create({ data });
  }

  // Read
  async findById(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({ where: { id } });
  }
  async listBySubscriptionId(subscriptionId: string): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({ where: { subscriptionId } });
  }

  // Update
  async updateStatusById(
    id: string,
    status: $Enums.TransactionStatus,
  ): Promise<Transaction> {
    return this.prisma.transaction.update({ where: { id }, data: { status } });
  }

  // Delete
  async deleteById(id: string): Promise<Transaction> {
    return this.prisma.transaction.delete({ where: { id } });
  }
}
