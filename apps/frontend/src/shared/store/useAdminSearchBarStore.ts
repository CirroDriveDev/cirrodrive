import { create } from "zustand";

interface AdminSearchBarState {
  searchTerms: {
    name: string;
    ownerName: string;
    pricingPlan: string;
    createdAt: string;
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
    ownerName: "",
    pricingPlan: "",
    createdAt: "",
  },
  setSearchTerm: (field, value) =>
    set((state) => ({
      searchTerms: { ...state.searchTerms, [field]: value },
    })),
  resetSearchTerms: () =>
    set({
      searchTerms: {
        name: "",
        ownerName: "",
        pricingPlan: "",
        createdAt: "",
      },
    }),
}));
