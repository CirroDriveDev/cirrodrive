import { create } from "zustand";

interface UserSearchBarState {
  searchTerm: string;
  searchFields: {
    id: boolean;
    username: boolean;
    email: boolean;
    createdAt: boolean;
    currentPlanId: boolean;
  };
  setSearchTerm: (term: string) => void;
  toggleSearchField: (field: keyof UserSearchBarState["searchFields"]) => void;
  resetSearch: () => void;
}

export const useUserSearchBarStore = create<UserSearchBarState>((set) => ({
  searchTerm: "",
  searchFields: {
    id: true,
    username: false,
    email: false,
    createdAt: false,
    currentPlanId: false,
  },
  setSearchTerm: (term) => set({ searchTerm: term }),
  toggleSearchField: (field) =>
    set((state) => ({
      searchFields: {
        ...state.searchFields,
        [field]: !state.searchFields[field],
      },
    })),
  resetSearch: () =>
    set({
      searchTerm: "",
      searchFields: {
        id: true,
        username: false,
        email: false,
        createdAt: false,
        currentPlanId: false,
      },
    }),
}));
