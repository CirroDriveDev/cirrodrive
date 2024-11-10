import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createUserSlice, type UserSlice } from "@/shared/store/userSlice.ts";

// 모든 슬라이스를 포함하는 상태 타입
type StoreState = UserSlice;

/**
 * 전역 Store 사용을 위한 Hook
 *
 * - UserSlice: `user`, `isAuthenticated`, `setUser`, `clearUser`
 *
 * @example
 *
 * ```ts
 * import { useBoundStore } from "@/shared/store/useBoundStore.ts";
 *
 * const PrintUsername = () => {
 *   const { user, isAuthenticated } = useBoundStore();
 *   return <div>{isAuthenticated ? user?.username : "로그인하지 않음"}</div>;
 * };
 * ```
 */
export const useBoundStore = create<StoreState>()(
  // devtools 미들웨어를 사용하여 브라우저 확장 프로그램을 통해 상태를 디버깅
  devtools(
    // persist 미들웨어를 사용하여 상태를 로컬 스토리지에 저장
    persist(
      // immer 미들웨어를 사용하여 불변성을 유지하면서 상태를 업데이트
      immer((...opts) => ({
        ...createUserSlice(...opts),
      })),
      // persist 미들웨어의 옵션
      {
        name: "store", // 로컬 스토리지에 저장될 이름
        // partialize 함수를 사용하여 특정 state만 저장
        partialize: (slices) => ({
          user: slices.user,
        }),
      },
    ),
  ),
);
