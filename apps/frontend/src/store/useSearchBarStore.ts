import { useBoundStore } from "#store/useBoundStore.js";
import type { SearchBarStore } from "#store/useBoundStore.js";

export const useSearchBarStore = (): SearchBarStore => {
  const { searchTerm, setSearchTerm } = useBoundStore();

  return {
    searchTerm,
    setSearchTerm,
  };
};
