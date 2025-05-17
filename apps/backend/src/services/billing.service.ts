import { injectable } from "inversify";
import type { $Enums } from "@cirrodrive/database";
import { BillingAgreementRepository } from "@/repositories/billing-agreement.repository";

@injectable()
export class BillingService {
  constructor(private readonly billingRepo: BillingAgreementRepository) {}

  async confirmBilling(id: string, status: string) {
    if (!["ACTIVE", "CANCELED", "PENDING"].includes(status)) {
      throw new Error("Invalid status");
    }

    // 타입 단언 시 $Enums 사용
    const typedStatus = status as $Enums.BillingStatus;

    return this.billingRepo.updateStatusById(id, typedStatus);
  }
}
