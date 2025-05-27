import { injectable } from "inversify";
import { prisma, type PrismaTx } from "#loaders/prisma.loader";
import { TxContext } from "#decorators/transactional";

@injectable()
export class BaseRepository {
  protected get prisma(): PrismaTx {
    return TxContext.get() ?? prisma;
  }
}
