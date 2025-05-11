import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/services/trpc.ts";
import { entryListQueryKey } from "@/services/useEntryList.ts";
import { trashEntryListQueryKey } from "@/services/useTrashEntryList.ts";

// 파일 및 폴더 이름 변경 Hook의 반환값 인터페이스 정의
interface UseFileRename {
  handleRenameFile: (newName: string) => void;
  handleRenameFolder: (newName: string) => void;
  isRenaming: boolean;
  success: boolean | null;
}

// useFileRename Hook 정의
export const useFileRename = (id: string, _p0?: boolean): UseFileRename => {
  const queryClient = useQueryClient();
  const [isRenaming, setIsRenaming] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);

  // 파일 이름 변경 mutation
  const fileMutation = trpc.file.updateFileName.useMutation({
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

  // 폴더 이름 변경 mutation
  const folderMutation = trpc.folder.rename.useMutation({
    onMutate: () => {
      setIsRenaming(true);
      setSuccess(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entryListQueryKey });
      setSuccess(true);
    },
    onError: () => {
      setSuccess(false);
    },
    onSettled: () => {
      setIsRenaming(false);
    },
  });

  // 파일 이름 변경 처리 함수
  const handleRenameFile = (newName: string): void => {
    if (isRenaming) return;
    fileMutation.mutate({ fileId: id, name: newName });
  };

  // 폴더 이름 변경 처리 함수
  const handleRenameFolder = (newName: string): void => {
    if (isRenaming) return;
    folderMutation.mutate({ folderId: id, name: newName });
  };

  // Hook 반환 값
  return {
    handleRenameFile,
    handleRenameFolder,
    isRenaming,
    success,
  };
};
