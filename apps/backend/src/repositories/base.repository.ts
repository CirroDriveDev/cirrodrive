import { injectable } from "inversify";
import { prisma, type PrismaTx } from "@/loaders/prisma.loader.ts";
import { TxContext } from "@/contexts/tx-context.ts";

@injectable()
export class BaseRepository {
  protected get prisma(): PrismaTx {
    return TxContext.get() ?? prisma;
  }
}
