import { trpc } from "#services/trpc.js";

export const useUpload = () => {
  const urlMutation = trpc.file.getS3PresignedUploadURL.useMutation();
  const completeMutation = trpc.file.upload.completeUpload.useMutation();

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

    const result = await completeMutation.mutateAsync({
      key,
      folderId,
    });
    return result;
  }

  return {
    upload,
    isPending: urlMutation.isPending || completeMutation.isPending,
    isError: urlMutation.isError || completeMutation.isError,
    error: urlMutation.isError ? urlMutation.error : completeMutation.error,
  };
};
