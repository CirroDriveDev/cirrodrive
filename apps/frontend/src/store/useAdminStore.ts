import { useBoundStore } from "#store/useBoundStore.js";
import type { AdminStore } from "#store/useBoundStore.js";

export const useAdminStore = (): AdminStore => {
  const { admin, setAdmin, clearAdmin } = useBoundStore();
  return { admin, setAdmin, clearAdmin };
};
