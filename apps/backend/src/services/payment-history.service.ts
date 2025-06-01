import { inject, injectable } from "inversify";
import { PaymentRepository } from "#repositories/payment.repository";

@injectable()
export class PaymentHistoryService {
  constructor(
    @inject(PaymentRepository)
    private readonly paymentRepository: PaymentRepository,
  ) {}

  public async getPaymentHistory(params: {
    userId: string;
    limit: number;
    cursor?: string;
  }): Promise<{
    payments: {
      id: string;
      amount: number;
      currency: string;
      status: "paid" | "failed" | "pending";
      paidAt: string;
      method: string;
      description: string | null;
    }[];
    nextCursor?: string;
  }> {
    const { userId, limit, cursor } = params;
    const take = limit + 1;
    const payments = await (
      this.paymentRepository as unknown as {
        findMany: (args: {
          where: { userId: string };
          orderBy: { paidAt: "desc" };
          take: number;
          cursor?: { id: string };
          skip?: number;
        }) => Promise<
          {
            id: string;
            amount: number;
            currency: string;
            status: string;
            paidAt: Date | string;
            method: string;
            description: string | null;
          }[]
        >;
      }
    ).findMany({
      where: { userId },
      orderBy: { paidAt: "desc" },
      take,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    let nextCursor: string | undefined;
    if (payments.length > limit) {
      const nextItem = payments.pop();
      nextCursor = nextItem?.id;
    }

    const result = payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status as "paid" | "failed" | "pending",
      paidAt:
        p.paidAt instanceof Date ? p.paidAt.toISOString() : String(p.paidAt),
      method: p.method,
      description: p.description,
    }));

    return { payments: result, nextCursor };
  }
}
