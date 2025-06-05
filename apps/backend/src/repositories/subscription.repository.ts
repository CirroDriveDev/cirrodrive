import { injectable } from "inversify";
import { Prisma, Subscription } from "@cirrodrive/database/prisma";
import { BaseRepository } from "#repositories/base.repository";

@injectable()
export class SubscriptionRepository extends BaseRepository {
  async create(
    data: Prisma.SubscriptionUncheckedCreateInput,
  ): Promise<Subscription> {
    return this.prisma.subscription.create({ data });
  }

  async getById(id: string): Promise<Subscription> {
    return this.prisma.subscription.findUniqueOrThrow({
      where: { id },
    });
  }

  async getByIdWithPlan(id: string) {
    return this.prisma.subscription.findUniqueOrThrow({
      where: { id },
      include: {
        plan: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({ where: { userId } });
  }

  async findCurrentByUser(userId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({
      where: { userId, status: { in: ["TRIAL", "ACTIVE"] } },
      orderBy: { startedAt: "desc" },
    });
  }

  async findAll(): Promise<Subscription[]> {
    return this.prisma.subscription.findMany();
  }

  async updateById(
    id: string,
    data: Prisma.SubscriptionUpdateInput,
  ): Promise<Subscription> {
    return this.prisma.subscription.update({ where: { id }, data });
  }

  async deleteById(id: string): Promise<Subscription> {
    return this.prisma.subscription.delete({ where: { id } });
  }

  async findSubscriptionsDueForBilling(currentDate: Date) {
    return this.prisma.subscription.findMany({
      where: {
        status: { in: ["TRIAL", "ACTIVE"] },
        nextBillingAt: { lte: currentDate },
      },
      include: {
        plan: true,
        billing: true,
        user: true,
      },
    });
  }
}
