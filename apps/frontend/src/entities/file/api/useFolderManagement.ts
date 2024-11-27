import { useState } from "react";
import { trpc } from "@/shared/api/trpc.ts";

interface Folder {
  id: number;
  name: string;
  files: string[];
}

interface UseFolderManagement {
  folders: Folder[];
  createFolder: (name: string) => void;
}

export const useFolderManagement = (): UseFolderManagement => {
  const [folders, setFolders] = useState<Folder[]>([]);

  const folderMutation = trpc.folder.create.useMutation({
    onSuccess: (data) => {
      setFolders((prev) => [
        ...prev,
        { id: data.id, name: data.name, files: [] },
      ]);
    },
  });

  const createFolder = (name: string): void => {
    if (!name.trim()) return;
    folderMutation.mutate({ name });
  };

  return {
    folders,
    createFolder,
  };
};
