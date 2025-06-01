import { inject, injectable } from "inversify";
import {
  CardTypeK2ESchema,
  OwnerTypeK2ESchema,
} from "@cirrodrive/schemas/billing";
import type { TossBilling } from "@cirrodrive/schemas/toss";
import type { Card } from "@cirrodrive/database/prisma";
import { CardRepository } from "#repositories/card.repository";

@injectable()
export class CardService {
  constructor(
    @inject(CardRepository)
    private readonly cardRepository: CardRepository,
  ) {}

  public async createCardFromBilling(billing: TossBilling): Promise<Card> {
    const card = await this.cardRepository.create({
      userId: billing.customerKey,
      acquirerCode: billing.card.acquirerCode,
      cardCompany: billing.cardCompany,
      cardType: CardTypeK2ESchema.parse(billing.card.cardType),
      issuerCode: billing.card.issuerCode,
      number: billing.card.number,
      ownerType: OwnerTypeK2ESchema.parse(billing.card.ownerType),
    });
    return card;
  }
}
