import type { StateCreator } from "zustand";
import type { User } from "@cirrodrive/schemas";

export interface UserSlice {
  /**
   * 사용자 정보
   *
   * - 로그인한 경우 사용자 데이터
   * - 로그인하지 않은 경우 `null`
   */
  user: User | null;

  /**
   * 사용자 정보를 설정
   *
   * @param user - 사용자 데이터
   */
  setUser: (user: User) => void;

  /**
   * 사용자 정보를 초기화
   */
  clearUser: () => void;
}

export type CreateUserSlice = StateCreator<
  UserSlice,
  [
    ["zustand/immer", never],
    ["zustand/persist", unknown],
    ["zustand/devtools", never],
  ],
  [],
  UserSlice
>;

export const createUserSlice: CreateUserSlice = (set) => ({
  user: null,
  setUser: (user) =>
    set((state) => {
      state.user = user;
    }),
  clearUser: () =>
    set((state) => {
      state.user = null;
    }),
});
