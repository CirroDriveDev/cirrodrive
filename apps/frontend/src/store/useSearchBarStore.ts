import { useBoundStore } from "@/store/useBoundStore.ts";
import type { SearchBarStore } from "@/store/useBoundStore.ts";

export const useSearchBarStore = (): SearchBarStore => {
  const { searchTerm, setSearchTerm } = useBoundStore();

  return {
    searchTerm,
    setSearchTerm,
  };
};
