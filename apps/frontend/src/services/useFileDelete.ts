import { useState } from "react";
import { trpc } from "@/services/trpc.ts";
import { useEntryUpdatedEvent } from "@/services/useEntryUpdatedEvent.ts";

interface UseFileDelete {
  handleFileDelete: () => void; // 삭제하기 함수
  isMutatingFile: boolean; // 요청 진행 상태
  success: boolean | null; // 요청 성공 여부
}

export const useFileDelete = (fileId: string): UseFileDelete => {
  const { entryUpdatedEvent } = useEntryUpdatedEvent();
  const [isMutatingFile, setIsMutatingFile] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);

  const mutation = trpc.file.delete.useMutation({
    onMutate: () => {
      setIsMutatingFile(true);
      setSuccess(null); // 성공 여부 초기화
    },
    onSuccess: async () => {
      await entryUpdatedEvent();
      setSuccess(true); // 요청 성공 시 성공 여부를 true로 설정
    },
    onError: () => {
      setSuccess(false); // 요청 실패 시 성공 여부를 false로 설정
    },
    onSettled: () => {
      setIsMutatingFile(false); // 요청 완료 시 진행 상태를 false로 설정
    },
  });

  const handleFileDelete = (): void => {
    if (isMutatingFile) return; // 요청 중 중복 호출 방지
    mutation.mutate({ fileId });
  };

  return {
    handleFileDelete,
    isMutatingFile,
    success,
  };
};
