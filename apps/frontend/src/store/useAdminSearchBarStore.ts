import { create } from "zustand";

interface AdminSearchBarState {
  searchTerms: {
    name: string; // 파일이름
    updatedAt: string; // 수정날짜
    size: string; // 크기
    id: string; // ID
  };
  setSearchTerm: (
    field: keyof AdminSearchBarState["searchTerms"],
    value: string,
  ) => void;
  resetSearchTerms: () => void;
}

export const useAdminSearchBarStore = create<AdminSearchBarState>((set) => ({
  searchTerms: {
    name: "",
    updatedAt: "",
    size: "",
    id: "",
  },
  setSearchTerm: (field, value) =>
    set((state) => ({
      searchTerms: { ...state.searchTerms, [field]: value },
    })),
  resetSearchTerms: () =>
    set({
      searchTerms: {
        name: "",
        updatedAt: "",
        size: "",
        id: "",
      },
    }),
}));
