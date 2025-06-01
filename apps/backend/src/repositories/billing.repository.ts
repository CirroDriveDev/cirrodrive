import { injectable } from "inversify";
import { Prisma, Billing } from "@cirrodrive/database/prisma";
import { BaseRepository } from "#repositories/base.repository";

@injectable()
export class BillingRepository extends BaseRepository {
  async create(data: Prisma.BillingUncheckedCreateInput): Promise<Billing> {
    return this.prisma.billing.create({ data });
  }

  async findById(id: string): Promise<Billing | null> {
    return this.prisma.billing.findUnique({ where: { id } });
  }

  async listByUserId(userId: string): Promise<Billing[]> {
    return this.prisma.billing.findMany({
      where: { userId },
      orderBy: {
        priority: "asc",
      },
    });
  }

  async findAll(): Promise<Billing[]> {
    return this.prisma.billing.findMany();
  }

  async updateById(
    id: string,
    data: Prisma.BillingUpdateInput,
  ): Promise<Billing> {
    return this.prisma.billing.update({ where: { id }, data });
  }

  async deleteById(id: string): Promise<Billing> {
    return this.prisma.billing.delete({ where: { id } });
  }
}
