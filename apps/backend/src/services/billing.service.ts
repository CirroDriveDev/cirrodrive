import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import {
  MethodK2ESchema,
  CardTypeK2ESchema,
  OwnerTypeK2ESchema,
} from "@cirrodrive/schemas/billing";
import { TossPaymentsService } from "#services/toss-payments.service";
import { Symbols } from "#types/symbols";
import { Transactional } from "#decorators/transactional";
import { BillingRepository } from "#repositories/billing.repository";

@injectable()
export class BillingService {
  constructor(
    @inject(Symbols.Logger) private readonly logger: Logger,
    @inject(TossPaymentsService) private readonly toss: TossPaymentsService,
    @inject(BillingRepository)
    private readonly billingRepository: BillingRepository,
  ) {
    this.logger = logger.child({ serviceName: "BillingService" });
  }

  /**
   * 토스페이먼츠 빌링키 발급 (카드 등록)
   *
   * @param authKey Toss 인증키
   * @param customerKey 고객 고유키
   */
  @Transactional()
  public async registerBilling({
    authKey,
    customerKey,
  }: {
    authKey: string;
    customerKey: string;
  }) {
    const tossBilling = await this.toss.issueBillingKey({
      authKey,
      customerKey,
    });

    if (tossBilling.customerKey !== customerKey) {
      throw new Error("발급된 고객 키와 요청한 고객 키가 일치하지 않습니다.");
    }

    const { mId, authenticatedAt, method, billingKey, card, cardCompany } =
      tossBilling;
    const { issuerCode, acquirerCode, number, cardType, ownerType } = card;

    const previousBillingList =
      await this.billingRepository.listByUserId(customerKey);

    const priority = previousBillingList.length;

    // 빌링키 발급 후 Billing 레코드 생성
    const billing = await this.billingRepository.create({
      userId: customerKey,
      mId,
      customerKey,
      authenticatedAt,
      method: MethodK2ESchema.parse(method),
      billingKey,
      cardIssuerCode: issuerCode,
      cardAcquirerCode: acquirerCode,
      cardNumber: number,
      cardType: CardTypeK2ESchema.parse(cardType),
      cardOwnerType: OwnerTypeK2ESchema.parse(ownerType),
      cardCompany,
      priority,
    });

    this.logger.info(`Billing key issued for user ${customerKey}`);

    return billing;
  }

  public async getById(id: string) {
    const billing = await this.billingRepository.findById(id);
    if (!billing) {
      throw new Error(`Billing with id ${id} not found.`);
    }
    return billing;
  }

  /**
   * UserId로 빌링 객체 조회
   */
  public async listByUserId(userId: string) {
    return this.billingRepository.listByUserId(userId);
  }

  /**
   * 빌링이 사용 중인지 확인
   *
   * @param userId 사용자 ID
   * @param billingId 빌링 ID
   */
  public async isBillingUsed(billingId: string) {
    const billing =
      await this.billingRepository.findByIdWithSubscriptions(billingId);

    if (!billing) {
      throw new Error(`Billing with id ${billingId} not found.`);
    }

    // 빌링이 구독에 사용 중인지 확인
    const isUsed = billing.subscriptions.some(
      (subscription) =>
        subscription.status === "ACTIVE" || subscription.status === "TRIAL",
    );

    return isUsed;
  }

  /**
   * 빌링 삭제
   *
   * @param billingId 빌링 ID
   */
  @Transactional()
  public async deleteById(billingId: string) {
    const billing = await this.billingRepository.findById(billingId);
    if (!billing) {
      throw new Error(`Billing with id ${billingId} not found.`);
    }

    // 빌링이 사용 중인지 확인
    const isUsed = await this.isBillingUsed(billingId);
    if (isUsed) {
      throw new Error("Billing is currently in use and cannot be deleted.");
    }

    // 빌링 삭제
    return this.billingRepository.deleteById(billingId);
  }
}
