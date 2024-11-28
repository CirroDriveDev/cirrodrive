import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/shared/api/trpc.ts";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { entryListQueryKey } from "@/entities/entry/api/useEntryList.ts";
import { trashEntryListQueryKey } from "@/entities/entry/api/useTrashEntryList.ts";

interface UseFolderManagement {
  folderName: string;
  setFolderName: (name: string) => void;
  parentFolderId: number;
  setParentFolderId: (id: number) => void;
  createFolder: () => void;
}

export const useFolderCreate = (): UseFolderManagement => {
  const { user } = useBoundStore();
  const queryClient = useQueryClient();
  const [folderName, setFolderName] = useState("새 폴더");
  const [parentFolderId, setParentFolderId] = useState(
    user?.rootFolderId ?? -1,
  );

  const folderMutation = trpc.folder.create.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entryListQueryKey });
      await queryClient.invalidateQueries({ queryKey: trashEntryListQueryKey });
    },
  });

  const createFolder = (): void => {
    if (!folderName.trim()) return;
    if (parentFolderId === -1) return;
    folderMutation.mutate({ name: folderName, parentFolderId });
  };

  return {
    folderName,
    setFolderName,
    parentFolderId,
    setParentFolderId,
    createFolder,
  };
};
