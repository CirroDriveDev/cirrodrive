import { useBoundStore } from "@/store/useBoundStore.ts";
import type { UserStore } from "@/store/useBoundStore.ts";

export const useUserStore = (): UserStore => {
  const { user, setUser, clearUser } = useBoundStore();

  return {
    user,
    setUser,
    clearUser,
  };
};
