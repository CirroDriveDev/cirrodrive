import { useState } from "react";
import { getQueryKey } from "@trpc/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/shared/api/trpc.ts";

interface UseFileRename {
  handleRename: (newName: string) => void;
  isRenaming: boolean;
  success: boolean | null;
}

export const useFileRename = (fileId: number): UseFileRename => {
  const queryClient = useQueryClient();
  const [isRenaming, setIsRenaming] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const folderGetQueryKey = getQueryKey(trpc.folder.get);

  const mutation = trpc.file.updateFileName.useMutation({
    onMutate: () => {
      setIsRenaming(true);
      setSuccess(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: folderGetQueryKey });
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
