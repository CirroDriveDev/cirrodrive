import { useBoundStore } from "#store/useBoundStore.js";
import type { UserStore } from "#store/useBoundStore.js";

export const useUserStore = (): UserStore => {
  const { user, setUser, clearUser } = useBoundStore();

  return {
    user,
    setUser,
    clearUser,
  };
};
