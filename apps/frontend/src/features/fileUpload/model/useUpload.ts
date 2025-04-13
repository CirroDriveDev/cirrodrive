import { useState } from "react";
import type { UseTRPCMutationOptions } from "@trpc/react-query/shared";
import type { AppRouter, RouterInput, RouterOutput } from "@cirrodrive/backend";
import type { TRPCClientErrorLike } from "@trpc/client";
import { trpc } from "@/shared/api/trpc.ts";

interface UseUpload {
  upload: (
    file: File,
    folderId?: number,
    opts?: UseUploadOptions,
  ) => Promise<void>;
  code: string | undefined;
  isPending: boolean;
  error: string | null;
}

type UseUploadOptions = UseTRPCMutationOptions<
  RouterInput["file"]["completeUpload"],
  TRPCClientErrorLike<AppRouter>,
  RouterOutput["file"]["completeUpload"]
>;

export const useUpload = (): UseUpload => {
  const [error, setError] = useState<string | null>(null);
  const urlMutation = trpc.file.getS3PresignedUploadURL.useMutation();
  const completeMutation = trpc.file.completeUpload.useMutation();
  const isPending = urlMutation.isPending || completeMutation.isPending;
  const code = completeMutation.data?.code;

  async function upload(
    file: File,
    folderId?: number,
    opts?: UseUploadOptions,
  ): Promise<void> {
    await urlMutation.mutateAsync({ fileName: file.name });

    if (!urlMutation.isSuccess) {
      setError("Failed to get presigned URL");
      return;
    }

    const url = urlMutation.data.presignedUploadURL;
    const key = urlMutation.data.key;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!res.ok) {
      setError("Failed to upload file");
      return;
    }

    completeMutation.mutate(
      { key, folderId },
      {
        onSuccess: (data, variable, context) => {
          opts?.onSuccess?.(data, variable, context);
        },
        onError: (trpcError, variable, context) => {
          setError(trpcError.message);
          opts?.onError?.(trpcError, variable, context);
        },
      },
    );
  }

  return {
    upload,
    code,
    isPending,
    error,
  };
};
