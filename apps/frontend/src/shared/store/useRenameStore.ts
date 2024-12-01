import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import type { RenameStore } from "@/shared/store/useBoundStore.ts";

export const useRenameStore = (): RenameStore => {
  const { folderId, setFolderId, clearFolderId } = useBoundStore();

  return {
    folderId,
    setFolderId,
    clearFolderId,
  };
};
