import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import type { SearchBarStore } from "@/shared/store/useBoundStore.ts";

export const useSearchBarStore = (): SearchBarStore => {
  const { searchTerm, setSearchTerm } = useBoundStore();

  return {
    searchTerm,
    setSearchTerm,
  };
};
