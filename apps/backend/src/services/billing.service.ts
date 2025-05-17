import { injectable } from "inversify";
import type { BillingAgreementRepository } from "@/repositories/billing-agreement.repository";

@injectable()
export class BillingService {
  // 타입 명시하고 사용하지 않으면 접두어 `_` 붙임
  constructor(private readonly _billingRepo: BillingAgreementRepository) {}

  // 미사용 인자는 접두어 `_` 붙여 eslint 경고 제거
  async confirmBilling(_id: string, _status: string) {
    // 정의만, 구현 없음
  }
}
