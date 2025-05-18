import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import axios from "axios";
import { TossBillingSchema, type TossBilling } from "@cirrodrive/schemas";
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
}
