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
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
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
      uploadRequests.map((request) => limit(() => uploadSingleFile(request)))
    );

    setIsPending(false);
    const success = uploadResults.filter(r => r.success);
    const errors = uploadResults.filter(r => !r.success);

    if (success.length > 0) options.onSuccess?.(success);
    if (errors.length > 0) options.onError?.(errors);
  };

  return {
    isPending,
    uploadResults,
    uploadFiles,
  };
}

export function useUploadSingleFile(options: UseUploadSingleFileOptions) {
  const { useUploader, onSuccess, onError } = options;
  const { upload } = useUploader();
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const completeUploadMutation = trpc.file.upload.completeUpload.useMutation();

  const uploadSingleFile = async (uploadRequest: UploadRequest) => {
    const { file, folderId, signal, onProgress } = uploadRequest;

    try {
      const s3UploadResult = await upload(file, { signal, onProgress });

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
          }
        );
      } else {
        const result: UploadResultError = {
          success: false,
          file,
          error: s3UploadResult.error || "S3 업로드 실패",
        };
        setUploadResult(result);
        onError?.(result);
      }
    } catch (err) {
      const result: UploadResultError = {
        success: false,
        file,
        error: err instanceof Error ? err.message : "알 수 없는 오류",
      };
      setUploadResult(result);
      onError?.(result);
    }
  };

  return {
    uploadSingleFile,
    uploadResult,
  };
}
