import { useState } from "react";
import { trpc } from "@/shared/api/trpc.ts";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { useEntryUpdatedEvent } from "@/entities/entry/api/useEntryUpdatedEvent.ts";

interface UseFolderManagement {
  folderName: string;
  setFolderName: (name: string) => void;
  parentFolderId: number;
  setParentFolderId: (id: number) => void;
  createFolder: () => void;
}

export const useFolderCreate = (): UseFolderManagement => {
  const { user } = useBoundStore();
  const [folderName, setFolderName] = useState("새 폴더");
  const { entryUpdatedEvent } = useEntryUpdatedEvent();

  if (user === null) {
    throw new Error("User must be defined");
  }

  const [parentFolderId, setParentFolderId] = useState(user.rootFolderId);

  const folderMutation = trpc.folder.create.useMutation({
    onSuccess: async () => {
      await entryUpdatedEvent();
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
