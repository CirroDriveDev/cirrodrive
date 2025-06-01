import { inject, injectable } from "inversify";
import { $Enums } from "@cirrodrive/database/prisma";
import { SubscriptionRepository } from "#repositories/subscription.repository";

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
  public async findById(id: string) {
    return this.subscriptionRepository.findById(id);
  }
}
