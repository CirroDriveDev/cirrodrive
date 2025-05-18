import { injectable } from "inversify";
import { Prisma, Subscription, type $Enums } from "@cirrodrive/database";
import { BaseRepository } from "@/repositories/base.repository.ts";
import { DBNotFoundError } from "@/errors/db-error-classes.ts";

@injectable()
export class SubscriptionRepository extends BaseRepository {
  // Create
  public async create(
    data: Prisma.SubscriptionUncheckedCreateInput,
  ): Promise<Subscription> {
    return this.prisma.subscription.create({ data });
  }

  // Read
  public async getByCustomerKey(customerKey: string): Promise<Subscription> {
    const result = await this.prisma.subscription.findUnique({
      where: { customerKey },
    });
    if (!result) {
      throw new DBNotFoundError("Subscription (customerKey)", { customerKey });
    }
    return result;
  }

  public async getByUserId(userId: string): Promise<Subscription> {
    const result = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    if (!result) {
      throw new DBNotFoundError("Subscription (userId)", { userId });
    }
    return result;
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

  // Delete
  public async deleteById(id: string): Promise<Subscription> {
    return this.prisma.subscription.delete({
      where: { id },
    });
  }
}
