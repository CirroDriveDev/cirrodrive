import { useState } from "react";
import pLimit from "p-limit";
import { toast } from "react-toastify";
import {
  type UploadResultError,
  type UploadResultSuccess,
  type UploadResult,
  type UseUploader,
  type S3UploadResult,
} from "#types/use-uploader.js";
import { trpc } from "#services/trpc.js";
import { entryUpdatedEvent } from "#services/entryUpdatedEvent.js";
import { useTransferStore } from "#store/useTransferStore.js";

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
  onSingleFileSuccess?: (result: UploadResultSuccess) => void;
  onSingleFileError?: (result: UploadResultError) => void;
}

export function useUploadFiles(options: UseUploadFilesOptions) {
  const [isPending, setIsPending] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const { uploadSingleFile } = useUploadSingleFile({
    useUploader: options.useUploader,
    onSingleFileSuccess: options.onSingleFileSuccess,
    onSingleFileError: options.onSingleFileError,
  });

  const uploadFiles = async (uploadRequests: UploadRequest[]) => {
    setIsPending(true);
    const limit = pLimit(3);
    const results: UploadResult[] = [];

    await Promise.all(
      uploadRequests.map((request) =>
        limit(() =>
          uploadSingleFile(request).then((result) => {
            results.push(result);
          })
        )
      )
    );

    setIsPending(false);
    setUploadResults(results);

    const success = results.filter((r): r is UploadResultSuccess => r.success);
    const errors = results.filter((r): r is UploadResultError => !r.success);

    if (success.length > 0) options.onSuccess?.(success);
    if (errors.length > 0) options.onError?.(errors);
  };

  return {
    isPending,
    uploadFiles,
    uploadResults,
  };
}

export function useUploadSingleFile(options: UseUploadSingleFileOptions) {
  const { useUploader, onSingleFileSuccess, onSingleFileError } = options;
  const { upload } = useUploader();
  const completeUploadMutation = trpc.file.upload.completeUpload.useMutation();
  const { addTransfer, updateProgress, setStatus } = useTransferStore();

  const uploadSingleFile = async (
    uploadRequest: UploadRequest
  ): Promise<UploadResult> => {
    const { file, folderId, signal: externalSignal, onProgress } = uploadRequest;
    const id = crypto.randomUUID();
    const controller = new AbortController();
    const signal = externalSignal ?? controller.signal;

    const retry = () => {
      void uploadSingleFile({ file, folderId });
    };

    addTransfer({
      id,
      type: "upload",
      file,
      progress: 0,
      transferredBytes: 0,
      totalBytes: file.size,
      status: "inProgress",
      error: undefined,
      cancel: () => controller.abort(),
      retry,
    });

    try {
      const s3UploadResult: S3UploadResult = await upload(file, {
        signal,
        onProgress: (percent) => {
          updateProgress(id, percent);
          onProgress?.(percent);
        },
      });

      if (s3UploadResult.success) {
        try {
          const data = await completeUploadMutation.mutateAsync({
            fileName: file.name,
            key: s3UploadResult.key,
            folderId,
          });

          void entryUpdatedEvent();

          const result: UploadResultSuccess = {
            success: true,
            file,
            fileId: data.fileId,
            code: data.code,
          };

          setStatus(id, "success");
          toast.success(`✅ ${file.name} 업로드 완료`);
          onSingleFileSuccess?.(result);
          return result;
        } catch {
          const result: UploadResultError = {
            success: false,
            file,
            error: "업로드 등록 실패",
          };
          setStatus(id, "error", result.error);
          toast.error(`❌ ${file.name} 등록 실패`);
          onSingleFileError?.(result);
          return result;
        }
      } else {
        const result: UploadResultError = {
          success: false,
          file,
          error: "S3 업로드 실패",
        };
        setStatus(id, "error", result.error);
        toast.error(`❌ ${file.name} 업로드 실패`);
        onSingleFileError?.(result);
        return result;
      }
    } catch (err: unknown) {
      let errorMessage = "알 수 없는 오류";

      if (err instanceof Error) {
        errorMessage = err.message;

        if (err.name === "AbortError") {
          setStatus(id, "cancelled");
          toast.warning(`⚠️ ${file.name} 업로드 취소됨`);
        } else {
          setStatus(id, "error", errorMessage);
          toast.error(`❌ ${file.name} 업로드 실패`);
        }
      } else {
        setStatus(id, "error", errorMessage);
        toast.error(`❌ ${file.name} 업로드 실패`);
      }

      const result: UploadResultError = {
        success: false,
        file,
        error: errorMessage,
      };

      onSingleFileError?.(result);
      return result;
    }
  };

  return {
    uploadSingleFile,
  };
}
