import { useState } from "react";
import type { RouterInput, RouterOutput, AppRouter } from "@cirrodrive/backend";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { UseTRPCMutationOptions } from "@trpc/react-query/shared";
import { trpc } from "@/shared/api/trpc.ts";

type UseFileUploadOptions = UseTRPCMutationOptions<
  RouterInput["file"]["upload"],
  TRPCClientErrorLike<AppRouter>,
  RouterOutput["file"]["upload"]
>;

interface UseFileUpload {
  uploadError: string | undefined;
  isPending: boolean;

  /**
   * 파일 선택 이벤트를 처리하는 함수
   */
  handleFileSelect: () => void;
}

export const useUpload = (
  folderId: number,
  opts?: UseFileUploadOptions,
): UseFileUpload => {
  const [uploadError, setUploadError] = useState<string>();

  const mutation = trpc.file.upload.useMutation({
    ...opts,
    onSuccess: (data, variable, context) => {
      opts?.onSuccess?.(data, variable, context);
    },
    onError: (error, variable, context) => {
      setUploadError(error.message);
      opts?.onError?.(error, variable, context);
    },
  });

  const handleFileSelect = (): void => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "*"; // 필요한 경우 파일 형식 제한 가능
    fileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folderId", folderId.toString());

        mutation.mutate(formData);
      }
    };
    fileInput.click();
  };

  return {
    uploadError,
    isPending: mutation.isPending,
    handleFileSelect,
  };
};
