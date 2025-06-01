import { inject, injectable } from "inversify";
import { $Enums } from "@cirrodrive/database/prisma";
import { SubscriptionRepository } from "#repositories/subscription.repository";

interface CancelSubscriptionOptions {
  reason?: string;
  retainUntil?: boolean; // true: 기간 만료까지 유지, false: 즉시 중단
}

@injectable()
export class SubscriptionService {
  constructor(
    @inject(SubscriptionRepository)
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  // 구독 생성
  public async create(data: {
    userId: string;
    planId: string;
    billingId: string;
    status: $Enums.SubscriptionStatus;
    startedAt: Date;
    expiresAt: Date;
    nextBillingAt: Date;
    canceledAt?: Date;
    cancellationReason?: string;
    trialEndsAt?: Date;
  }) {
    return this.subscriptionRepository.create(data);
  }

  // 구독 단건 조회
  public async getById(id: string) {
    return this.subscriptionRepository.getById(id);
  }

  // 구독 단건 조회 (Plan 정보 포함)
  public async getByIdWithPlan(id: string) {
    return this.subscriptionRepository.getByIdWithPlan(id);
  }

  // 현재 구독 조회 (TRIAL, ACTIVE, etc.)
  public async findCurrentByUser(userId: string) {
    return this.subscriptionRepository.findCurrentByUser(userId);
  }

  public async markAsUnpaid(subscriptionId: string) {
    const subscription =
      await this.subscriptionRepository.getById(subscriptionId);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // 상태 확인
    if (["CANCELED", "EXPIRED"].includes(subscription.status)) {
      return; // 이미 취소된 경우 아무 것도 하지 않음
    }

    // 상태 업데이트
    return await this.subscriptionRepository.updateById(subscriptionId, {
      status: "UNPAID",
    });
  }

  // 구독 취소
  public async cancel(
    subscriptionId: string,
    options: CancelSubscriptionOptions,
  ): Promise<void> {
    const { reason = "user_cancel", retainUntil = true } = options;
    const subscription =
      await this.subscriptionRepository.getById(subscriptionId);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // 상태 확인
    if (["CANCELED", "EXPIRED"].includes(subscription.status)) {
      return; // 이미 취소된 경우 아무 것도 하지 않음
    }

    // 상태 업데이트
    const now = new Date();
    const canceledAt = now;
    const expiresAt =
      retainUntil ?
        (subscription.expiresAt ?? subscription.nextBillingAt)
      : now;

    await this.subscriptionRepository.updateById(subscriptionId, {
      status: "CANCELED",
      canceledAt,
      cancellationReason: reason,
      expiresAt,
    });
  }
}
