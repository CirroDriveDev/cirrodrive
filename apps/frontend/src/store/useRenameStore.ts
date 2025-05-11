import { useBoundStore } from "@/store/useBoundStore.ts";
import type { RenameStore } from "@/store/useBoundStore.ts";

export const useRenameStore = (): RenameStore => {
  const { folderId, setFolderId, clearFolderId } = useBoundStore();

  return {
    folderId,
    setFolderId,
    clearFolderId,
  };
};
