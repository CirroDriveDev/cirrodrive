import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import type { UserStore } from "@/shared/store/useBoundStore.ts";

export const useUserStore = (): UserStore => {
  const { user, setUser, clearUser } = useBoundStore();

  return {
    user,
    setUser,
    clearUser,
  };
};
