import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@cirrodrive/backend";
import { trpc } from "@/shared/api/trpc.ts";

interface UseUpload {
  upload: (
    file: File,
    folderId?: string,
  ) => Promise<{
    fileId: string;
    code?: string;
  }>;
  isPending: boolean;
  isError: boolean;
  error: TRPCClientErrorLike<AppRouter> | null;
}

export const useUpload = (): UseUpload => {
  const urlMutation = trpc.file.getS3PresignedUploadURL.useMutation();
  const completeMutation = trpc.file.completeUpload.useMutation();

  async function upload(
    file: File,
    folderId?: string,
  ): Promise<{ fileId: string; code?: string }> {
    const { presignedUploadURL, key } = await urlMutation.mutateAsync({
      fileName: file.name,
    });

    try {
      await fetch(presignedUploadURL, {
        method: "PUT",
        credentials: "omit",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });
    } catch {
      throw new Error("Failed to upload file");
    }

    const { fileId, code } = await completeMutation.mutateAsync({
      key,
      folderId,
    });
    return { fileId, code };
  }

  return {
    upload,
    isPending: urlMutation.isPending || completeMutation.isPending,
    isError: urlMutation.isError || completeMutation.isError,
    error: urlMutation.isError ? urlMutation.error : completeMutation.error,
  };
};
