import { useBoundStore } from "#store/useBoundStore.js";
import type { AdminStore } from "#store/useBoundStore.js";

export const useAdminStore = (): AdminStore => {
  const admin = useBoundStore((state) => state.admin);
  const setAdmin = useBoundStore((state) => state.setAdmin);
  const clearAdmin = useBoundStore((state) => state.clearAdmin);
  return { admin, setAdmin, clearAdmin };
};
