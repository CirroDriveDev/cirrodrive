import { useCallback } from "react";
import { toast } from "react-toastify";
import { useUploadCore } from "./upload-core.js";
import {
  createUploadId,
  formatUploadError,
  type UploadOptions,
} from "./upload-utils.js";
import { useTransferStore } from "#store/useTransferStore.js";
import { entryUpdatedEvent } from "#services/entryUpdatedEvent.js";
import { trpc } from "#services/trpc.js";

export interface UseUploadOptions {
  onSuccess?: (fileId: string, code: string) => void;
  onError?: (error: string) => void;
  suppressToast?: boolean;
}

export const useUpload = (options: UseUploadOptions = {}) => {
  const uploadCore = useUploadCore();
  const { addTransfer, updateProgress, setStatus } = useTransferStore();
  const utils = trpc.useUtils();

  const uploadFile = useCallback(
    async (file: File, uploadOptions: UploadOptions = {}) => {
      const id = createUploadId();
      const controller = new AbortController();
      const signal = uploadOptions.signal ?? controller.signal;

      // Transfer Store에 추가
      addTransfer({
        id,
        type: "upload",
        file,
        progress: 0,
        transferredBytes: 0,
        totalBytes: file.size,
        status: "inProgress",
        cancel: () => controller.abort(),
        retry: () => uploadFile(file, uploadOptions),
      });

      try {
        const result = await uploadCore.uploadFile(file, {
          ...uploadOptions,
          signal,
          onProgress: (percent) => {
            updateProgress(id, percent);
            uploadOptions.onProgress?.(percent);
          },
        });

        if (result.success && result.fileId) {
          // 성공 처리
          setStatus(id, "success");
          if (!options.suppressToast) {
            toast.success(`✅ ${file.name} 업로드 완료`);
          }

          // 캐시 무효화
          void entryUpdatedEvent();
          void utils.storage.getUsage.invalidate();

          options.onSuccess?.(result.fileId, result.code ?? "");
          return { success: true, fileId: result.fileId, code: result.code };
        }
        // 실패 처리
        const errorMessage = result.error ?? "알 수 없는 오류";
        setStatus(id, "error", errorMessage);
        if (!options.suppressToast) {
          toast.error(`❌ ${file.name} 업로드 실패: ${errorMessage}`);
        }
        options.onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } catch (error) {
        const errorMessage = formatUploadError(error);

        if (signal.aborted) {
          setStatus(id, "cancelled");
          if (!options.suppressToast) {
            toast.warning(`⚠️ ${file.name} 업로드 취소됨`);
          }
        } else {
          setStatus(id, "error", errorMessage);
          if (!options.suppressToast) {
            toast.error(`❌ ${file.name} 업로드 실패: ${errorMessage}`);
          }
          options.onError?.(errorMessage);
        }

        return { success: false, error: errorMessage };
      }
    },
    [uploadCore, addTransfer, updateProgress, setStatus, options, utils],
  );

  const uploadFiles = useCallback(
    async (files: File[], uploadOptions: UploadOptions = {}) => {
      if (files.length === 1) {
        // 단일 파일 업로드는 uploadFile 함수를 사용
        return uploadFile(files[0], uploadOptions);
      }
      const uploadFileOptions = {
        ...uploadOptions,
        folderId: uploadOptions.folderId,
        suppressToast: true,
      };

      const results = await Promise.allSettled(
        files.map((file) => uploadFile(file, uploadFileOptions)),
      );

      const successful = results.filter(
        (r) => r.status === "fulfilled" && r.value.success,
      ).length;
      const failed = results.length - successful;

      if (!options.suppressToast) {
        if (successful > 0) {
          toast.success(`✅ ${successful}개 파일 업로드 완료`);
        }
        if (failed > 0) {
          toast.error(`❌ ${failed}개 파일 업로드 실패`);
        }
      }

      return results;
    },
    [uploadFile, options.suppressToast],
  );

  return {
    uploadFile,
    uploadFiles,
  };
};
