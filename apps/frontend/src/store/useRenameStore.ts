import { useBoundStore } from "#store/useBoundStore.js";
import type { RenameStore } from "#store/useBoundStore.js";

export const useRenameStore = (): RenameStore => {
  const { folderId, setFolderId, clearFolderId } = useBoundStore();

  return {
    folderId,
    setFolderId,
    clearFolderId,
  };
};
