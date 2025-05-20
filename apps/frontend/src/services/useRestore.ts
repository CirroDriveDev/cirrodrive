import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "#services/trpc.js";
import { entryListQueryKey } from "#services/useEntryList.js";
import { trashEntryListQueryKey } from "#services/useTrashEntryList.js";

interface UseRestore {
  handleRestore: (type: "file" | "folder") => void; // 복원 함수 (파일/폴더 구분)
  isMutating: boolean; // 요청 진행 상태
  success: boolean | null; // 요청 성공 여부
}

export const useRestore = (id: string): UseRestore => {
  const queryClient = useQueryClient();
  const [isMutating, setIsMutating] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);

  // 파일 복원 Mutation
  const fileMutation = trpc.file.restoreFromTrash.useMutation({
    onMutate: () => {
      setIsMutating(true);
      setSuccess(null); // 초기화
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entryListQueryKey });
      await queryClient.invalidateQueries({ queryKey: trashEntryListQueryKey });
      setSuccess(true); // 성공 상태
    },
    onError: () => {
      setSuccess(false); // 실패 상태
    },
    onSettled: () => {
      setIsMutating(false); // 진행 상태 초기화
    },
  });

  // 폴더 복원 Mutation
  const folderMutation = trpc.folder.restoreFromTrash.useMutation({
    onMutate: () => {
      setIsMutating(true);
      setSuccess(null); // 초기화
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entryListQueryKey });
      await queryClient.invalidateQueries({ queryKey: trashEntryListQueryKey });
      setSuccess(true); // 성공 상태
    },
    onError: () => {
      setSuccess(false); // 실패 상태
    },
    onSettled: () => {
      setIsMutating(false); // 진행 상태 초기화
    },
  });

  // 파일 또는 폴더 복원
  const handleRestore = (type: "file" | "folder"): void => {
    if (isMutating) return; // 중복 호출 방지
    if (type === "file") {
      fileMutation.mutate({ fileId: id });
    } else if (type === "folder") {
      folderMutation.mutate({ folderId: id });
    }
  };

  return {
    handleRestore,
    isMutating,
    success,
  };
};
