import { useState } from "react";
import { trpc } from "@/shared/api/trpc.ts";
import { useEntryUpdatedEvent } from "@/entities/entry/api/useEntryUpdatedEvent.ts";

interface UseFileRename {
  handleRename: (newName: string) => void;
  isRenaming: boolean;
  success: boolean | null;
}

export const useFileRename = (fileId: number): UseFileRename => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const { entryUpdatedEvent } = useEntryUpdatedEvent();

  const mutation = trpc.file.updateFileName.useMutation({
    onMutate: () => {
      setIsRenaming(true);
      setSuccess(null);
    },
    onSuccess: async () => {
      await entryUpdatedEvent();
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
