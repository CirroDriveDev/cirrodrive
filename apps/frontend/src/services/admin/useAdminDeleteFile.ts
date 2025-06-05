import { toast } from "react-toastify"; // react-toastify에서 toast 가져오기
import { trpc } from "#services/trpc"; // TRPC 클라이언트 인스턴스

export function useAdminDeleteFile() {
  // TRPC 컨텍스트를 가져와서 캐시 무효화 등에 사용합니다.
  const utils = trpc.useContext();
  const deleteMutation = trpc.protected.file.deleteFile.useMutation({
    onSuccess: () => {
      toast.success("파일 삭제가 완료되었습니다.");
      // 페이지 새로고침 대신 파일 목록 쿼리를 무효화하여 다시 불러옵니다.
      void utils.protected.file.listFiles.invalidate();
    },
  });

  const deleteFile = async (fileId: string): Promise<void> => {
    try {
      await deleteMutation.mutateAsync({ fileId });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류 발생";
      if (errorMessage.includes("권한")) {
        toast.error("파일 삭제 권한이 없습니다.");
      } else {
        toast.error(`파일 삭제 실패: ${errorMessage}`);
      }
      throw error;
    }
  };

  return { deleteFile, ...deleteMutation };
}
