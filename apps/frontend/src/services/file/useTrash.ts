import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/services/trpc.ts";
import { entryListQueryKey } from "@/services/useEntryList.ts";
import { trashEntryListQueryKey } from "@/services/useTrashEntryList.ts";

interface UseTrash {
  handleTrash: (type: "file" | "folder") => void; // 휴지통으로 이동 함수 (파일/폴더 구분)
  isMutating: boolean; // 요청 진행 상태
  success: boolean | null; // 요청 성공 여부
}

export const useTrash = (id: string): UseTrash => {
  const queryClient = useQueryClient();
  const [isMutating, setIsMutating] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);

  // 파일 휴지통 이동 Mutation
  const fileMutation = trpc.file.trash.useMutation({
    onMutate: () => {
      setIsMutating(true);
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
      setIsMutating(false);
    },
  });

  // 폴더 휴지통 이동 Mutation
  const folderMutation = trpc.folder.trash.useMutation({
    onMutate: () => {
      setIsMutating(true);
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
      setIsMutating(false);
    },
  });

  // 파일 또는 폴더를 휴지통으로 이동
  const handleTrash = (type: "file" | "folder"): void => {
    if (isMutating) return; // 중복 호출 방지
    if (type === "file") {
      fileMutation.mutate({ fileId: id });
    } else if (type === "folder") {
      folderMutation.mutate({ folderId: id });
    }
  };

  return {
    handleTrash,
    isMutating,
    success,
  };
};
