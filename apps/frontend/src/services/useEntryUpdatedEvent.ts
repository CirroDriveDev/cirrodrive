import { useQueryClient } from "@tanstack/react-query";
import { entryListQueryKey } from "@/services/useEntryList.ts";
import { trashEntryListQueryKey } from "@/services/useTrashEntryList.ts";
import { entryGetRecursivelyQueryKey } from "@/services/useEntryGetRecursively.ts";

interface UseEntryUpdatedEvent {
  entryUpdatedEvent: () => Promise<void>;
}

export const useEntryUpdatedEvent = (): UseEntryUpdatedEvent => {
  const queryClient = useQueryClient();

  const entryUpdatedEvent = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: entryListQueryKey });
    await queryClient.invalidateQueries({ queryKey: trashEntryListQueryKey });
    await queryClient.invalidateQueries({
      queryKey: entryGetRecursivelyQueryKey,
    });
  };

  return {
    entryUpdatedEvent,
  };
};
