import { injectable } from "inversify";
import { Prisma, UsageRecord } from "@cirrodrive/database/prisma";
import { BaseRepository } from "#repositories/base.repository";

@injectable()
export class UsageRecordRepository extends BaseRepository {
  async create(
    data: Prisma.UsageRecordUncheckedCreateInput,
  ): Promise<UsageRecord> {
    return this.prisma.usageRecord.create({ data });
  }

  async findById(id: string): Promise<UsageRecord | null> {
    return this.prisma.usageRecord.findUnique({ where: { id } });
  }

  async findAllByUserId(userId: string): Promise<UsageRecord[]> {
    return this.prisma.usageRecord.findMany({ where: { userId } });
  }

  async findAll(): Promise<UsageRecord[]> {
    return this.prisma.usageRecord.findMany();
  }

  async deleteById(id: string): Promise<UsageRecord> {
    return this.prisma.usageRecord.delete({ where: { id } });
  }
}
