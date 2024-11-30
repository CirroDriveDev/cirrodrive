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
   * FormData를 업로드하는 함수
   */
  handleFileSelect: (formData: FormData) => void;
}

export const useDragUpload = (
  _folderId: number,
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

  const handleFileSelect = (formData: FormData): void => {
    mutation.mutate(formData); // 업로드 트리거
  };

  return {
    uploadError,
    isPending: mutation.isPending,
    handleFileSelect,
  };
};
