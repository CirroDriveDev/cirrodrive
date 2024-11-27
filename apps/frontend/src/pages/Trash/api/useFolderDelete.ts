import { useState } from "react";
import { getQueryKey } from "@trpc/react-query"; //다시 불러오기
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/shared/api/trpc.ts";

interface UseFolderDelete {
  handleFolderDelete: () => void; // 폴더 삭제 함수
  isMutatingFolder: boolean; // 요청 진행 상태
  success: boolean | null; // 요청 성공 여부
}

export const useFolderDelete = (folderId: number): UseFolderDelete => {
  const queryClient = useQueryClient(); //다시
  const [isMutatingFolder, setIsMutatingFolder] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const folderGetQueryKey = getQueryKey(trpc.folder.get); //다시

  const mutation = trpc.folder.delete.useMutation({
    onMutate: () => {
      setIsMutatingFolder(true);
      setSuccess(null); // 성공 여부 초기화
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: folderGetQueryKey }); //다시
      setSuccess(true); // 요청 성공 시 성공 여부를 true로 설정
    },
    onError: () => {
      setSuccess(false); // 요청 실패 시 성공 여부를 false로 설정
    },
    onSettled: () => {
      setIsMutatingFolder(false); // 요청 완료 시 진행 상태를 false로 설정
    },
  });

  const handleFolderDelete = (): void => {
    if (isMutatingFolder) return; // 요청 중 중복 호출 방지
    mutation.mutate({ folderId });
  };

  return {
    handleFolderDelete,
    isMutatingFolder,
    success,
  };
};
