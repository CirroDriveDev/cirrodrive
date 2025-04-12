import { useState } from "react";
import { trpc } from "@/shared/api/trpc.ts";

interface UseUpload {
  upload: (file: File, folderId?: number) => Promise<void>;
  code: string | undefined;
  isPending: boolean;
  error: string | null;
}

export const useUpload = (): UseUpload => {
  const [error, setError] = useState<string | null>(null);
  const urlMutation = trpc.file.getS3PresignedUploadURL.useMutation();
  const completeMutation = trpc.file.completeUpload.useMutation();
  const isPending = urlMutation.isPending || completeMutation.isPending;
  const code = completeMutation.data?.code;

  async function upload(file: File, folderId?: number): Promise<void> {
    urlMutation.mutate({ fileName: file.name });

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

    completeMutation.mutate({ key, folderId });
  }

  return {
    upload,
    code,
    isPending,
    error,
  };
};
