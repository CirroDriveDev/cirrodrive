import { useState } from "react";
import pLimit from "p-limit";
import { type UploadResult, type UseUploader } from "#types/use-uploader.js";
import { trpc } from "#services/trpc.js";

interface UploadRequest {
  file: File;
  folderId?: string;
}

/**
 * 다중 파일 업로드 상태 및 병렬 업로드 로직을 관리하는 커스텀 훅 (completeUpload 훅 포함)
 */
export function useUploadFiles(useUploader: UseUploader) {
  const [isPending, setIsPending] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const { upload } = useUploader();
  const completeUploadMutation = trpc.file.upload.completeUpload.useMutation();

  const completeUpload = async (key: string, folderId?: string) => {
    return await completeUploadMutation.mutateAsync({ key, folderId });
  };

  const uploadFiles = async (uploadRequests: UploadRequest[]) => {
    setIsPending(true);
    const results: UploadResult[] = [];
    const limit = pLimit(3);

    const uploadSingleFile = async (
      file: File,
      folderId?: string,
    ): Promise<void> => {
      const result = await upload(file);
      if (result.success) {
        await completeUpload(result.key, folderId);
      }
      results.push(result);
    };

    await Promise.all(
      uploadRequests.map((request) =>
        limit(() => uploadSingleFile(request.file, request.folderId)),
      ),
    );
    setUploadResults(results);
    setIsPending(false);
  };

  return {
    isPending,
    uploadResults,
    uploadFiles,
    completeUpload,
  };
}
