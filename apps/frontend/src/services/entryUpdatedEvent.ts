import { entryListQueryKey } from "#services/useEntryList.js";
import { trashEntryListQueryKey } from "#services/useTrashEntryList.js";
import { entryGetRecursivelyQueryKey } from "#services/useEntryGetRecursively.js";
import { queryClient } from "#app/provider/queryClient.js";

export const entryUpdatedEvent = async (): Promise<void> => {
  await queryClient.invalidateQueries({ queryKey: entryListQueryKey });
  await queryClient.invalidateQueries({ queryKey: trashEntryListQueryKey });
  await queryClient.invalidateQueries({
    queryKey: entryGetRecursivelyQueryKey,
  });
};
