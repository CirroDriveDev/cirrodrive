import { injectable } from "inversify";
import { prisma, type PrismaTx } from "#loaders/prisma.loader.js";
import { TxContext } from "#decorators/transactional.js";

@injectable()
export class BaseRepository {
  protected get prisma(): PrismaTx {
    return TxContext.get() ?? prisma;
  }
}
