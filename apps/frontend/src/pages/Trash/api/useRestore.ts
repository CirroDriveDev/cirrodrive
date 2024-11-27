import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/shared/api/trpc.ts";
import { entryListQueryKey } from "@/entities/entry/api/useEntryList.ts";
import { trashEntryListQueryKey } from "@/entities/entry/api/useTrashEntryList.ts";

interface UseRestore {
  restore: () => void; // 복원하기 함수
  isMutating: boolean; // 요청 진행 상태
  success: boolean | null; // 요청 성공 여부
}

export const useRestore = (fileId: number): UseRestore => {
  const queryClient = useQueryClient(); //다시
  const [isMutating, setIsMutating] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);

  const mutation = trpc.file.restoreFromTrash.useMutation({
    onMutate: () => {
      setIsMutating(true);
      setSuccess(null); // 성공 여부 초기화
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entryListQueryKey });
      await queryClient.invalidateQueries({ queryKey: trashEntryListQueryKey });
      setSuccess(true); //요청 성공 시 성공 여부를 true로 설정
    },
    onError: () => {
      setSuccess(false); ////요청 실패 시 성공 여부를 false로 설정
    },
    onSettled: () => {
      setIsMutating(false); //요청 완료 시 진행 상태를 false로 설정
    },
  });
  // 복원하기 이동
  const restore = (): void => {
    if (isMutating) return; // 요청 중 중복 호출 방지
    mutation.mutate({ fileId });
  };
  //사용할 값 반환
  return {
    restore,
    isMutating,
    success,
  };
};
