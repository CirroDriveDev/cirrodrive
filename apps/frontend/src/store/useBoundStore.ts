import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { StateCreator } from "zustand";
import type { UserDTO } from "@cirrodrive/schemas/user";
import type { AdminUser } from "#types/admin.js";
import {
  type FileTransferStatus,
  type FileTransfer,
} from "#types/file-transfer.js";

// ------------------------------------
// Store Slice Interfaces
// ------------------------------------

export interface UserStore {
  user: UserDTO | null;
  setUser: (user: UserDTO) => void;
  clearUser: () => void;
}

export interface ModalStore {
  isOpen: boolean;
  title: string;
  content: React.ReactNode | null;
  openModal: (args: { title: string; content: React.ReactNode }) => void;
  closeModal: () => void;
}

export interface SearchBarStore {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export interface RenameStore {
  folderId: string | null;
  setFolderId: (folderId: string) => void;
  clearFolderId: () => void;
}

export interface JwtStore {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export interface AdminStore {
  admin: AdminUser | null;
  setAdmin: (admin: AdminUser) => void;
  clearAdmin: () => void;
}

export interface TransferStore {
  transfers: FileTransfer[];
  addTransfer: (transfer: FileTransfer) => void;
  updateProgress: (id: string, progress: number) => void;
  setStatus: (id: string, status: FileTransferStatus, error?: string) => void;
  removeTransfer: (id: string) => void;
}

export interface RedirectStore {
  /**
   * 리다이렉트할 경로
   */
  redirectPath: string | null;
  /**
   * 리다이렉트 경로를 설정
   *
   * @param path - 리다이렉트할 경로
   */
  setRedirectPath: (path: string) => void;
  /**
   * 리다이렉트 경로를 초기화
   */
  clearRedirectPath: () => void;
}

// 모든 슬라이스를 포함하는 상태 타입
export type StoreState = UserStore &
  ModalStore &
  SearchBarStore &
  RenameStore &
  JwtStore &
  AdminStore &
  TransferStore &
  RedirectStore;

// ------------------------------------
// Store Slice Creators
// ------------------------------------

export const createUserSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  UserStore
> = (set) => ({
  user: null,
  setUser: (user) => set(() => ({ user })),
  clearUser: () => set(() => ({ user: null })),
});

export const createModalSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  ModalStore
> = (set) => ({
  isOpen: false,
  title: "",
  content: null,
  openModal: ({ title, content }) =>
    set(() => ({
      isOpen: true,
      title,
      content,
    })),
  closeModal: () =>
    set(() => ({
      isOpen: false,
      content: null,
    })),
});

export const createSearchBarSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  SearchBarStore
> = (set) => ({
  searchTerm: "",
  setSearchTerm: (term) => set(() => ({ searchTerm: term })),
});

export const createRenameSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  RenameStore
> = (set) => ({
  folderId: null,
  setFolderId: (folderId) => set(() => ({ folderId })),
  clearFolderId: () => set(() => ({ folderId: null })),
});

export const createJwtSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  JwtStore
> = (set) => ({
  token: null,
  setToken: (token) => set(() => ({ token })),
  clearToken: () => set(() => ({ token: null })),
});

export const createAdminSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  AdminStore
> = (set) => ({
  admin: null,
  setAdmin: (admin) => set(() => ({ admin })),
  clearAdmin: () => set(() => ({ admin: null })),
});

export const createTransferSlice: StateCreator<StoreState, [["zustand/immer", never]], [], TransferStore> = (set) => ({
  transfers: [],
  addTransfer: (transfer) =>
    set((state) => {
      state.transfers.push(transfer);
    }),
  updateProgress: (id, progress) =>
    set((state) => {
      const found = state.transfers.find((item) => item.id === id);
      if (found) found.progress = progress;
    }),
  setStatus: (id, status, error) =>
    set((state) => {
      const index = state.transfers.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.transfers[index] = {
          ...state.transfers[index],
          status,
          error: error ?? state.transfers[index].error,
        };
      }
    }),
  removeTransfer: (id) =>
    set((state) => {
      state.transfers = state.transfers.filter((item) => item.id !== id);
    }),
});

export const createRedirectSlice: StateCreator<
  StoreState,
  [
    ["zustand/immer", never],
    ["zustand/persist", unknown],
    ["zustand/devtools", never],
  ],
  [],
  RedirectStore
> = (set) => ({
  redirectPath: null,
  setRedirectPath: (path) =>
    set((state) => {
      state.redirectPath = path;
    }),
  clearRedirectPath: () =>
    set((state) => {
      state.redirectPath = null;
    }),
});

// ------------------------------------
// Store Hook
// ------------------------------------

export const useBoundStore = create<StoreState>()(
  devtools(
    persist(
      // immer 미들웨어를 사용하여 불변성을 유지하면서 상태를 업데이트
      immer((...opts) => ({
        ...createUserSlice(...opts),
        ...createModalSlice(...opts),
        ...createSearchBarSlice(...opts),
        ...createRenameSlice(...opts),
        ...createJwtSlice(...opts),
        ...createAdminSlice(...opts),
        ...createTransferSlice(...opts),
        ...createRedirectSlice(...opts),
      })),
      {
        name: "store", // 로컬 스토리지에 저장될 이름
        // partialize 함수를 사용하여 특정 state만 저장
        partialize: (slices) => ({
          user: slices.user,
          admin: slices.admin, // admin도 저장
          redirectPath: slices.redirectPath,
        }),
      }
    )
  )
);
