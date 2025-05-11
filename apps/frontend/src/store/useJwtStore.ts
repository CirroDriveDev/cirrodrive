import { create } from "zustand";
import { persist } from "zustand/middleware";

interface JwtStore {
  /**
   * JWT 토큰
   */
  token: string | null;

  /**
   * JWT 토큰을 설정
   *
   * @param token - JWT 토큰
   */
  setToken: (token: string) => void;

  /**
   * JWT 토큰을 초기화
   */
  clearToken: () => void;
}

export const useJwtStore = create<JwtStore>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set(() => ({ token })),
      clearToken: () => set(() => ({ token: null })),
    }),
    {
      name: "jwt-store", // 로컬 스토리지에 저장될 이름
    },
  ),
);
