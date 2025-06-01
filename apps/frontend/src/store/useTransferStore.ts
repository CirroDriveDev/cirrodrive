import { useBoundStore } from "#store/useBoundStore.js";
import type { TransferStore } from "#store/useBoundStore.js";

export const useTransferStore: () => TransferStore = () => {
  const { transfers, addTransfer, updateProgress, setStatus, removeTransfer } =
    useBoundStore();

  return {
    transfers,
    addTransfer,
    updateProgress,
    setStatus,
    removeTransfer,
  };
};
