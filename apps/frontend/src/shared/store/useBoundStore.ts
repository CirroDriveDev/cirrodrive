import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { StateCreator } from "zustand";
import type { UserDTO } from "@cirrodrive/schemas";

// ------------------------------------
// Store Slice Interfaces
// ------------------------------------

export interface UserStore {
  /**
   * 사용자 정보
   *
   * - 로그인한 경우 사용자 데이터
   * - 로그인하지 않은 경우 `null`
   */
  user: UserDTO | null;

  /**
   * 사용자 정보를 설정
   *
   * @param user - 사용자 데이터
   */
  setUser: (user: UserDTO) => void;

  /**
   * 사용자 정보를 초기화
   */
  clearUser: () => void;
}

export interface ModalStore {
  /**
   * 모달이 열려있는지 여부
   */
  isOpen: boolean;

  /**
   * 모달 제목
   */
  title: string;

  /**
   * 모달 내용
   */
  content: React.ReactNode | null;

  /**
   * 모달을 열기
   *
   * @param content - 모달 내용
   */
  openModal: ({
    title,
    content,
  }: {
    title: string;
    content: React.ReactNode;
  }) => void;

  /**
   * 모달을 닫기
   */
  closeModal: () => void;
}

export interface SearchBarStore {
  /**
   * 검색어
   */
  searchTerm: string;

  /**
   * 검색어를 설정
   *
   * @param term - 검색어
   */
  setSearchTerm: (term: string) => void;
}

export interface RenameStore {
  /**
   * 폴더 ID
   */
  folderId: number | null;

  /**
   * 폴더 ID를 설정
   *
   * @param folderId - 폴더 ID
   */
  setFolderId: (folderId: number) => void;

  /**
   * 폴더 ID를 초기화
   */
  clearFolderId: () => void;
}

export interface JwtStore {
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

// 모든 슬라이스를 포함하는 상태 타입
export type StoreState = UserStore &
  ModalStore &
  SearchBarStore &
  RenameStore &
  JwtStore;

// ------------------------------------
// Store Slice Creators
// ------------------------------------

export const createUserSlice: StateCreator<
  StoreState,
  [
    ["zustand/immer", never],
    ["zustand/persist", unknown],
    ["zustand/devtools", never],
  ],
  [],
  UserStore
> = (set) => ({
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

export const createModalSlice: StateCreator<
  StoreState,
  [
    ["zustand/immer", never],
    ["zustand/persist", unknown],
    ["zustand/devtools", never],
  ],
  [],
  ModalStore
> = (set) => ({
  isOpen: false,
  content: null,
  title: "",
  openModal: ({ title, content }) =>
    set((state) => {
      state.isOpen = true;
      state.title = title;
      state.content = content;
    }),
  closeModal: () =>
    set((state) => {
      state.isOpen = false;
      state.content = null;
    }),
});

export const createSearchBarSlice: StateCreator<
  StoreState,
  [
    ["zustand/immer", never],
    ["zustand/persist", unknown],
    ["zustand/devtools", never],
  ],
  [],
  SearchBarStore
> = (set) => ({
  searchTerm: "",
  setSearchTerm: (term) =>
    set((state) => {
      state.searchTerm = term;
    }),
});

export const createRenameSlice: StateCreator<
  StoreState,
  [
    ["zustand/immer", never],
    ["zustand/persist", unknown],
    ["zustand/devtools", never],
  ],
  [],
  RenameStore
> = (set) => ({
  folderId: 0,
  setFolderId: (folderId) =>
    set((state) => {
      state.folderId = folderId;
    }),
  clearFolderId: () =>
    set((state) => {
      state.folderId = null;
    }),
});

export const createJwtSlice: StateCreator<
  StoreState,
  [
    ["zustand/immer", never],
    ["zustand/persist", unknown],
    ["zustand/devtools", never],
  ],
  [],
  JwtStore
> = (set) => ({
  token: null,
  setToken: (token) =>
    set((state) => {
      state.token = token;
    }),
  clearToken: () =>
    set((state) => {
      state.token = null;
    }),
});

// ------------------------------------
// Store Hook
// ------------------------------------

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
        ...createModalSlice(...opts),
        ...createSearchBarSlice(...opts),
        ...createRenameSlice(...opts),
        ...createJwtSlice(...opts), // 추가: JWT 슬라이스
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
