import { useState } from "react";
import type {
  AppRouter,
  RouterInput,
  RouterOutput,
} from "@cirrodrive/backend/app-router";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { UseTRPCMutationOptions } from "@trpc/react-query/shared";
import { trpc } from "#services/trpc.js";
import { useBoundStore } from "#store/useBoundStore.js";
import { entryUpdatedEvent } from "#services/entryUpdatedEvent.js";

type UseFolderCreateOptions = UseTRPCMutationOptions<
  RouterInput["folder"]["create"],
  TRPCClientErrorLike<AppRouter>,
  RouterOutput["folder"]["create"]
>;

interface UseFolderManagement {
  folderName: string;
  setFolderName: (name: string) => void;
  parentFolderId: string;
  setParentFolderId: (id: string) => void;
  createFolder: () => void;
}

export const useFolderCreate = (
  opts?: UseFolderCreateOptions,
): UseFolderManagement => {
  const { user } = useBoundStore();
  const [folderName, setFolderName] = useState("새 폴더");

  if (user === null) {
    throw new Error("User must be defined");
  }

  const [parentFolderId, setParentFolderId] = useState(user.rootFolderId);

  const folderMutation = trpc.folder.create.useMutation({
    ...opts,
    onSuccess: async (data, variable, context) => {
      await entryUpdatedEvent();
      opts?.onSuccess?.(data, variable, context);
    },
  });

  const createFolder = (): void => {
    if (!folderName.trim()) return;
    if (parentFolderId === null) return;
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
