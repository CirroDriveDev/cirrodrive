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

  async findById(id: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({ where: { userId } });
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
}
