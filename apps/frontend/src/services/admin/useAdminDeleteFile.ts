// useAdminDeleteFile.ts
import { toast } from "react-toastify";
import { trpc } from "#services/trpc";

export function useAdminDeleteFile(skipToast = false) {
  const utils = trpc.useContext();
  const deleteMutation = trpc.protected.file.deleteFile.useMutation({
    onSuccess: () => {
      if (!skipToast) {
        toast.success("파일 삭제가 완료되었습니다.");
      }
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
      }
      throw error;
    }
  };

  return { deleteFile, ...deleteMutation };
}
