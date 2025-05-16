import { entryListQueryKey } from "@/services/useEntryList.ts";
import { trashEntryListQueryKey } from "@/services/useTrashEntryList.ts";
import { entryGetRecursivelyQueryKey } from "@/services/useEntryGetRecursively.ts";
import { queryClient } from "@/app/provider/queryClient.ts";

export const entryUpdatedEvent = async (): Promise<void> => {
  await queryClient.invalidateQueries({ queryKey: entryListQueryKey });
  await queryClient.invalidateQueries({ queryKey: trashEntryListQueryKey });
  await queryClient.invalidateQueries({
    queryKey: entryGetRecursivelyQueryKey,
  });
};
