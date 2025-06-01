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

  /**
   * 사용자 ID로 결제 목록을 커서 기반으로 페이징 조회합니다.
   *
   * @param userId 사용자 ID
   * @param pageSize 페이지당 항목 수
   * @param cursor 커서(마지막 항목의 id)
   * @returns 결제 목록 배열
   */
  async listByUserId(
    userId: string,
    options: {
      pageSize?: number;
      cursor?: string;
    },
  ): Promise<Payment[]> {
    const { pageSize, cursor } = options;
    return this.prisma.payment.findMany({
      where: { userId },
      take: pageSize,
      orderBy: { createdAt: "desc" },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });
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
