import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import axios from "axios";
import {
  TossBillingSchema,
  type TossBilling,
  TossPaymentSchema,
  type TossPayment,
  TossApiErrorV1Schema,
  TossApiErrorV2Schema,
} from "@cirrodrive/schemas/toss.js";
import { Symbols } from "#types/symbols.js";
import { env } from "#loaders/env.loader.js";
import { AppError } from "#errors/error-classes.js";

@injectable()
export class TossPaymentsService {
  private readonly baseURL = "https://api.tosspayments.com/v1";
  private readonly secretKey = env.PAYMENT_TOSS_SECRET_KEY;

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
          validateStatus: () => true,
        },
      );

      handleTossApiErrorResponse(response.data);

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
          validateStatus: () => true,
        },
      );

      handleTossApiErrorResponse(response.data);

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
        handleTossApiErrorResponse(error.response.data);
      }
      throw error;
    }
  }
}

/**
 * TossPaymentsService에서 발생하는 외부 결제 API 연동 에러를 나타냅니다.
 *
 * Toss API에서 반환한 에러 코드(tossCode)와 traceId(선택)를 포함합니다.
 *
 * @param message - 에러 메시지
 * @param tossCode - Toss API 에러 코드
 * @param traceId - Toss API 트레이스 ID(선택)
 */
export class TossPaymentsServiceError extends AppError {
  public readonly tossCode: string;
  public readonly traceId?: string;

  constructor(message: string, tossCode: string, traceId?: string) {
    super(message, "BAD_GATEWAY");
    this.tossCode = tossCode;
    this.traceId = traceId;
    this.name = "TossPaymentsServiceError";
  }
}

/**
 * Toss API 응답이 에러 응답(v1/v2)인지 Zod 스키마로 판별하고, 에러라면 code/message/traceId를 추출해
 * TossPaymentsServiceError로 throw합니다. 에러가 아니면 아무 동작도 하지 않습니다.
 *
 * @param data - Toss API 응답 데이터(성공/에러 모두 가능)
 * @throws TossPaymentsServiceError - Toss API 에러 응답(v1/v2)인 경우
 */
function handleTossApiErrorResponse(data: unknown): void | never {
  // v2 에러
  const v2 = TossApiErrorV2Schema.safeParse(data);
  if (v2.success) {
    const { code, message } = v2.data.error;
    const traceId = v2.data.traceId;
    throw new TossPaymentsServiceError(
      `Toss 결제 실패: ${message} (code: ${code}, traceId: ${traceId})`,
      code,
      traceId,
    );
  }
  // v1 에러
  const v1 = TossApiErrorV1Schema.safeParse(data);
  if (v1.success) {
    const { code, message } = v1.data;
    throw new TossPaymentsServiceError(
      `Toss 결제 실패: ${message} (code: ${code})`,
      code,
    );
  }
  // 에러 응답이 아니면 아무것도 하지 않음
}
