import { trpc } from "#services/trpc.js";
import { entryListQueryKey } from "#services/useEntryList.js";
import { trashEntryListQueryKey } from "#services/useTrashEntryList.js";
import { useQueryClient } from "@tanstack/react-query";

export function useTrashMany() {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  const fileMutation = trpc.file.trash.useMutation();
  const folderMutation = trpc.folder.trash.useMutation();

  const handleTrashMany = async (entries: { id: string; type: "file" | "folder" }[]) => {
    const promises = entries.map((entry) => {
      if (entry.type === "file") {
        return fileMutation.mutateAsync({ fileId: entry.id });
      } else {
        return folderMutation.mutateAsync({ folderId: entry.id });
      }
    });

    await Promise.all(promises);
    await queryClient.invalidateQueries({ queryKey: entryListQueryKey });
    await queryClient.invalidateQueries({ queryKey: trashEntryListQueryKey });
    void utils.storage.getUsage.invalidate();
  };

  return { handleTrashMany };
}
