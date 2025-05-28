import { useState } from "react";
import pLimit from "p-limit";
import { type UploadResult, type UseUploader } from "#types/use-uploader.js";
import { trpc } from "#services/trpc.js";
import { entryUpdatedEvent } from "#services/entryUpdatedEvent.js";

export interface UploadRequest {
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

  const completeUpload = async (
    fileName: string,
    key: string,
    folderId?: string,
  ) => {
    await completeUploadMutation.mutateAsync({ fileName, key, folderId });
    await entryUpdatedEvent();
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
        await completeUpload(file.name, result.key, folderId);
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
