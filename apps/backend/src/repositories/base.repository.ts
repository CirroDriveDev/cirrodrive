import { injectable } from "inversify";
import { prisma, type PrismaTx } from "@/loaders/prisma.loader.ts";
import { TxContext } from "@/decorators/transactional.ts";

@injectable()
export class BaseRepository {
  protected get prisma(): PrismaTx {
    return TxContext.get() ?? prisma;
  }
}
