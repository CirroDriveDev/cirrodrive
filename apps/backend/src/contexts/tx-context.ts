import type { PrismaTx } from "@/loaders/prisma.loader.ts";

class TxContext {
  private static _currentTx: PrismaTx | null = null;

  static set(tx: PrismaTx): void {
    this._currentTx = tx;
  }

  static get(): PrismaTx | null {
    return this._currentTx;
  }

  static clear(): void {
    this._currentTx = null;
  }
}

export { TxContext };
