import { useState } from "react";
import pLimit from "p-limit";
import {
  type UploadResultError,
  type UploadResultSuccess,
  type UploadResult,
  type UseUploader,
} from "#types/use-uploader.js";
import { trpc } from "#services/trpc.js";
import { entryUpdatedEvent } from "#services/entryUpdatedEvent.js";

export interface UploadRequest {
  file: File;
  folderId?: string;
}

interface UseUploadFilesOptions {
  useUploader: UseUploader;
  onSuccess?: (results: UploadResultSuccess[]) => void;
  onError?: (results: UploadResultError[]) => void;
  onSingleFileSuccess?: (result: UploadResultSuccess) => void;
  onSingleFileError?: (result: UploadResultError) => void;
}

interface UseUploadSingleFileOptions {
  useUploader: UseUploader;
  onSuccess?: (result: UploadResultSuccess) => void;
  onError?: (result: UploadResultError) => void;
}

/**
 * 다중 파일 업로드 상태 및 병렬 업로드 로직을 관리하는 커스텀 훅 (completeUpload 훅 포함)
 */
export function useUploadFiles(options: UseUploadFilesOptions) {
  const [isPending, setIsPending] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const { uploadSingleFile } = useUploadSingleFile({
    useUploader: options.useUploader,
    onSuccess: (result) => {
      setUploadResults((prev) => [...prev, result]);
      options.onSingleFileSuccess?.(result);
    },
    onError: (result) => {
      setUploadResults((prev) => [...prev, result]);
      options.onSingleFileError?.(result);
    },
  });

  const uploadFiles = async (uploadRequests: UploadRequest[]) => {
    setIsPending(true);
    const limit = pLimit(3);

    await Promise.all(
      uploadRequests.map((request) => limit(() => uploadSingleFile(request))),
    );
    setIsPending(false);
  };

  return {
    isPending,
    uploadResults,
    uploadFiles,
  };
}

/**
 * 단일 파일 업로드를 위한 커스텀 훅
 */
export function useUploadSingleFile(options: UseUploadSingleFileOptions) {
  const { useUploader, onSuccess, onError } = options;
  const { upload } = useUploader();
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const completeUploadMutation = trpc.file.upload.completeUpload.useMutation();

  const uploadSingleFile = async (uploadRequest: UploadRequest) => {
    const { file, folderId } = uploadRequest;
    const s3UploadResult = await upload(file);
    if (s3UploadResult.success) {
      await completeUploadMutation.mutateAsync(
        {
          fileName: file.name,
          key: s3UploadResult.key,
          folderId,
        },
        {
          onSuccess: (data) => {
            void entryUpdatedEvent();
            const result: UploadResultSuccess = {
              success: true,
              file,
              fileId: data.fileId,
              code: data.code,
            };
            setUploadResult(result);
            onSuccess?.(result);
          },
          onError: (error) => {
            const result: UploadResultError = {
              success: false,
              file,
              error: error.message || "파일 업로드에 실패했습니다.",
            };
            setUploadResult(result);
            onError?.(result);
          },
        },
      );
    }
  };

  return {
    uploadSingleFile,
    uploadResult,
  };
}
