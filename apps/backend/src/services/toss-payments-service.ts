import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import axios from "axios";
import {
  TossBillingSchema,
  type TossBilling,
  TossPaymentSchema,
  type TossPayment,
} from "@cirrodrive/schemas";
import { Symbols } from "@/types/symbols.ts";
import { env } from "@/loaders/env.loader.ts";

@injectable()
export class TossPaymentsService {
  private readonly baseURL = "https://api.tosspayments.com/v1";
  private readonly secretKey = env.TOSS_SECRET_KEY;

  constructor(@inject(Symbols.Logger) private logger: Logger) {
    this.logger = logger.child({ serviceName: "TossPaymentsService" });
  }

  private get authHeader() {
    const encoded = Buffer.from(`${this.secretKey}:`).toString("base64");
    return { Authorization: `Basic ${encoded}` };
  }

  /**
   * Toss Payments API를 통해 Billing Key를 발급합니다.
   *
   * @param authKey - Toss Payments에서 발급받은 인증키
   * @param customerKey - 고객의 고유 키
   * @returns Billing Key 발급 결과
   */
  public async issueBillingKey({
    authKey,
    customerKey,
  }: {
    authKey: string;
    customerKey: string;
  }): Promise<TossBilling> {
    const url = `${this.baseURL}/billing/authorizations/issue`;

    try {
      const response = await axios.post(
        url,
        {
          authKey,
          customerKey,
        },
        {
          headers: {
            ...this.authHeader,
            "Content-Type": "application/json",
          },
        },
      );

      return TossBillingSchema.parse(response.data);
    } catch (error) {
      this.logger.error(
        { err: error, authKey, customerKey },
        "Failed to issue billing key",
      );
      throw error;
    }
  }

  /**
   * Toss Payments API를 통해 카드 자동결제를 승인합니다.
   *
   * @param params - 결제에 필요한 정보
   * @returns 결제 승인 결과(Payment 객체)
   * @throws 결제 실패 시 에러 객체 반환
   */
  public async approveBillingPayment({
    billingKey,
    amount,
    customerKey,
    orderId,
    orderName,
    cardInstallmentPlan,
    customerEmail,
    customerName,
    taxFreeAmount,
    taxExemptionAmount,
  }: {
    billingKey: string;
    amount: number;
    customerKey: string;
    orderId: string;
    orderName: string;
    cardInstallmentPlan?: number;
    customerEmail?: string;
    customerName?: string;
    taxFreeAmount?: number;
    taxExemptionAmount?: number;
  }): Promise<TossPayment> {
    const url = `${this.baseURL}/billing/${billingKey}`;
    try {
      const response = await axios.post(
        url,
        {
          amount,
          customerKey,
          orderId,
          orderName,
          cardInstallmentPlan,
          customerEmail,
          customerName,
          taxFreeAmount,
          taxExemptionAmount,
        },
        {
          headers: {
            ...this.authHeader,
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30초 타임아웃 권장
        },
      );
      // 성공 시 Payment 객체 Zod 스키마로 검증 후 반환
      return TossPaymentSchema.parse(response.data);
    } catch (error: unknown) {
      // axios error 타입 가드
      const isAxiosError = (
        err: unknown,
      ): err is { response?: { data?: { message?: string; code?: string } } } =>
        typeof err === "object" && err !== null && "response" in err;
      this.logger.error(
        {
          err: isAxiosError(error) ? error.response?.data : error,
          billingKey,
          customerKey,
          orderId,
        },
        "Failed to approve billing payment",
      );
      if (isAxiosError(error) && error.response?.data) {
        throw new Error(
          `Toss 결제 실패: ${error.response.data.message} (code: ${error.response.data.code})`,
        );
      }
      throw error;
    }
  }
}
