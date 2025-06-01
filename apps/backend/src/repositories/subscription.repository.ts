import { injectable } from "inversify";
import {
  Prisma,
  type Subscription,
  type $Enums,
} from "@cirrodrive/database/prisma";
import { BaseRepository } from "#repositories/base.repository";
import { DBNotFoundError } from "#errors/db-error-classes";

@injectable()
export class SubscriptionRepository extends BaseRepository {
  // Create
  public async create(
    data: Prisma.SubscriptionUncheckedCreateInput,
  ): Promise<Subscription> {
    return this.prisma.subscription.create({ data });
  }

  // Read
  public async listByUserId(userId: string): Promise<Subscription[]> {
    const result = await this.prisma.subscription.findMany({
      where: { userId },
    });
    if (!result) {
      throw new DBNotFoundError("Subscription (userId)", { userId });
    }
    return result;
  }

  public async findById(id: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({
      where: { id },
    });
  }

  public async findActiveByUserId(
    userId: string,
  ): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
    });
  }

  // Update
  public async updateStatusById(
    id: string,
    status: $Enums.BillingStatus,
  ): Promise<Subscription> {
    return this.prisma.subscription.update({
      where: { id },
      data: { status },
    });
  }

  // 카드 정보 변경
  public async updateCardById(
    id: string,
    cardId: string,
  ): Promise<Subscription> {
    return this.prisma.subscription.update({
      where: { id },
      data: { cardId },
    });
  }

  // Delete
  public async deleteById(id: string): Promise<Subscription> {
    return this.prisma.subscription.delete({
      where: { id },
    });
  }
}
