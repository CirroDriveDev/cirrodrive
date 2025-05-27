import { injectable } from "inversify";
import { Prisma, type SubscriptionHistory } from "@cirrodrive/database/prisma";
import { BaseRepository } from "#repositories/base.repository";

@injectable()
export class SubscriptionHistoryRepository extends BaseRepository {
  // Create
  async create(
    data: Prisma.SubscriptionHistoryUncheckedCreateInput,
  ): Promise<SubscriptionHistory> {
    return this.prisma.subscriptionHistory.create({ data });
  }

  // Read
  async listBySubscriptionId(
    subscriptionId: string,
  ): Promise<SubscriptionHistory[]> {
    return this.prisma.subscriptionHistory.findMany({
      where: { subscriptionId },
    });
  }
  // Update
  // (구현 필요시 추가)
  // Delete
  // (구현 필요시 추가)
}
