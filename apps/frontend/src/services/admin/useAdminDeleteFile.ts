import { toast } from "react-toastify"; // react-toastify에서 toast 가져오기
import { trpc } from "#services/trpc"; // TRPC 클라이언트 인스턴스

export function useAdminDeleteFile() {
  const deleteMutation = trpc.protected.user.deleteFile.useMutation();

  const deleteFile = async (fileId: string): Promise<boolean> => {
    try {
      const response = await deleteMutation.mutateAsync({ fileId });
      return response.success;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류";
      toast.error(`파일 삭제 실패: ${errorMessage}`);
      return false;
    }
  };

  return { deleteFile, ...deleteMutation };
}
