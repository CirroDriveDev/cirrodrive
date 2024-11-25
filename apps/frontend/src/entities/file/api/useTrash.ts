import { useState } from "react";
import { getQueryKey } from "@trpc/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/shared/api/trpc.ts";

interface UseTrash {
  handleTrash: () => void; // 휴지통으로 이동 함수
  isMutating: boolean; // 요청 진행 상태
  success: boolean | null; // 요청 성공 여부
}

export const useTrash = (fileId: number): UseTrash => {
  const queryClient = useQueryClient();
  const [isMutating, setIsMutating] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const folderGetQueryKey = getQueryKey(trpc.folder.get);

  const mutation = trpc.file.trash.useMutation({
    onMutate: () => {
      setIsMutating(true);
      setSuccess(null); // 성공 여부 초기화
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: folderGetQueryKey });
      setSuccess(true); //요청 성공 시 성공 여부를 true로 설정
    },
    onError: () => {
      setSuccess(false); ////요청 실패 시 성공 여부를 false로 설정
    },
    onSettled: () => {
      setIsMutating(false); //요청 완료 시 진행 상태를 false로 설정
    },
  });
  // 파일을 휴지통으로 이동
  const handleTrash = (): void => {
    if (isMutating) return; // 요청 중 중복 호출 방지
    mutation.mutate({ fileId });
  };
  //사용할 값 반환
  return {
    handleTrash,
    isMutating,
    success,
  };
};
