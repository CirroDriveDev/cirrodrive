import { useState } from "react";
import { trpc } from "@/shared/api/trpc.ts";

interface UseDelete {
  handleDelete: () => void; // 삭제하기 함수
  isMutating: boolean; // 요청 진행 상태
  success: boolean | null; // 요청 성공 여부
}

export const useDelete = (fileId: number): UseDelete => {
  const [isMutating, setIsMutating] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);

  const mutation = trpc.file.delete.useMutation({
    onMutate: () => {
      setIsMutating(true);
      setSuccess(null); // 성공 여부 초기화
    },
    onSuccess: () => {
      setSuccess(true); // 요청 성공 시 성공 여부를 true로 설정
    },
    onError: () => {
      setSuccess(false); // 요청 실패 시 성공 여부를 false로 설정
    },
    onSettled: () => {
      setIsMutating(false); // 요청 완료 시 진행 상태를 false로 설정
    },
  });

  const handleDelete = (): void => {
    if (isMutating) return; // 요청 중 중복 호출 방지
    mutation.mutate({ fileId });
  };

  return {
    handleDelete,
    isMutating,
    success,
  };
};
