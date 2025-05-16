import { injectable } from "inversify";
import { Prisma, BillingAgreement, type $Enums } from "@cirrodrive/database";
import { BaseRepository } from "@/repositories/base.repository.ts";

@injectable()
export class BillingAgreementRepository extends BaseRepository {
  // create
  public async saveAgreement(
    data: Prisma.BillingAgreementUncheckedCreateInput,
  ): Promise<BillingAgreement> {
    return this.prisma.billingAgreement.create({ data });
  }

  // read
  public async findByCustomerKey(
    customerKey: string,
  ): Promise<BillingAgreement | null> {
    return this.prisma.billingAgreement.findUnique({
      where: { customerKey },
    });
  }

  public async findByUserId(userId: string): Promise<BillingAgreement[]> {
    return this.prisma.billingAgreement.findMany({
      where: { userId },
    });
  }

  // update
  public async updateStatusById(
    id: string,
    status: $Enums.BillingStatus,
  ): Promise<BillingAgreement> {
    return this.prisma.billingAgreement.update({
      where: { id },
      data: { status },
    });
  }

  // delete
  public async deleteById(id: string): Promise<BillingAgreement> {
    return this.prisma.billingAgreement.delete({
      where: { id },
    });
  }
}
