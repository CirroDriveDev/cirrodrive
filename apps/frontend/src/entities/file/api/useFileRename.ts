import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/shared/api/trpc.ts";
import { entryListQueryKey } from "@/entities/entry/api/useEntryList.ts";
import { trashEntryListQueryKey } from "@/entities/entry/api/useTrashEntryList.ts";

interface UseFileRename {
  handleRename: (newName: string) => void;
  isRenaming: boolean;
  success: boolean | null;
}

export const useFileRename = (fileId: number): UseFileRename => {
  const queryClient = useQueryClient();
  const [isRenaming, setIsRenaming] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);

  const mutation = trpc.file.updateFileName.useMutation({
    onMutate: () => {
      setIsRenaming(true);
      setSuccess(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entryListQueryKey });
      await queryClient.invalidateQueries({ queryKey: trashEntryListQueryKey });
      setSuccess(true);
    },
    onError: () => {
      setSuccess(false);
    },
    onSettled: () => {
      setIsRenaming(false);
    },
  });

  const handleRename = (newName: string): void => {
    if (isRenaming) return;
    mutation.mutate({ fileId, name: newName });
  };

  return { handleRename, isRenaming, success };
};
