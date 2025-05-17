import { injectable } from "inversify";
import { Prisma, Card } from "@cirrodrive/database";
import { BaseRepository } from "@/repositories/base.repository.ts";

@injectable()
export class CardRepository extends BaseRepository {
  // Create
  async create(data: Prisma.CardUncheckedCreateInput): Promise<Card> {
    return this.prisma.card.create({ data });
  }

  // Read
  async findById(id: string): Promise<Card | null> {
    return this.prisma.card.findUnique({ where: { id } });
  }
  async listByUserId(userId: string): Promise<Card[]> {
    return this.prisma.card.findMany({ where: { userId } });
  }

  // Delete
  async deleteById(id: string): Promise<Card> {
    return this.prisma.card.delete({ where: { id } });
  }
}
