import { injectable } from "inversify";
import type { Plan } from "@cirrodrive/database";
import type { BillingAgreementRepository } from "@/repositories/billing-agreement.repository";

@injectable()
export class BillingService {
  constructor(private readonly _billingRepo: BillingAgreementRepository) {}

  async confirmBilling(_id: string, _status: string): Promise<void> {
    // 구현 예정, 임시로 아무것도 하지 않고 Promise<void> 반환
    
  }

  async getCurrentPlan(_userId: string): Promise<Plan | null> {
  await Promise.resolve(); // eslint 경고 회피용 더미 await
  return null;
}
}
