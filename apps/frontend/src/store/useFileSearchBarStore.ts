import { create } from "zustand";

export type EntryType = "all" | "file" | "folder";

interface FileSearchBarFilters {
  name: string;
  updatedAt: string;     
  minSizeMB: string;
  maxSizeMB: string;
  type: EntryType;
}

interface FileSearchBarState {
  filters: FileSearchBarFilters;
  setFilter: <K extends keyof FileSearchBarFilters>(
    key: K,
    value: FileSearchBarFilters[K]
  ) => void;
  resetFilters: () => void;
}

export const useFileSearchBarStore = create<FileSearchBarState>((set) => ({
  filters: {
    name: "",
    updatedAt: "",        
    minSizeMB: "",
    maxSizeMB: "",
    type: "all",
  },
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  resetFilters: () =>
    set({
      filters: {
        name: "",
        updatedAt: "",     
        minSizeMB: "",
        maxSizeMB: "",
        type: "all",
      },
    }),
}));
