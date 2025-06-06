import { useCallback, useState } from "react";
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
import { useStorage } from "#services/file/useStorage.js";
import { formatStorage } from "#utils/formatStorage.js";

export interface UseUploadOptions {
  onSuccess?: (fileId: string, code: string) => void;
  onError?: (error: string) => void;
  suppressToast?: boolean;
  onStorageExceeded?: (requiredSize: number, availableSize: number) => void;
}

export const useUpload = (options: UseUploadOptions = {}) => {
  const storageInfo = useStorage();
  const uploadCore = useUploadCore();
  const { addTransfer, updateProgress, setStatus } = useTransferStore();
  const utils = trpc.useUtils();
  const [showStorageDialog, setShowStorageDialog] = useState(false);
  const [storageDialogData, setStorageDialogData] = useState<{
    required: number;
    available: number;
  } | null>(null);

  // 저장소 용량 검증 함수
  const checkStorageCapacity = useCallback(
    (
      fileSize: number,
    ): {
      canUpload: boolean;
      availableSpace: number;
    } => {
      const { used, quota } = storageInfo;
      const usedBytes = Number(used);
      const quotaBytes = Number(quota);
      const availableSpace = quotaBytes - usedBytes;
      return {
        canUpload: fileSize <= availableSpace,
        availableSpace,
      };
    },
    [storageInfo],
  );

  const checkMultipleFilesCapacity = useCallback(
    (
      files: File[],
    ): {
      canUpload: boolean;
      totalSize: number;
      availableSpace: number;
    } => {
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const { used, quota } = storageInfo;
      const usedBytes = Number(used);
      const quotaBytes = Number(quota);
      const availableSpace = quotaBytes - usedBytes;
      return {
        canUpload: totalSize <= availableSpace,
        totalSize,
        availableSpace,
      };
    },
    [storageInfo],
  );

  const uploadFile = useCallback(
    async (file: File, uploadOptions: UploadOptions = {}) => {
      // 업로드 전 저장소 용량 검증
      const storageCheckResult = checkStorageCapacity(file.size);
      if (!storageCheckResult.canUpload) {
        const errorMessage = `저장소 용량 부족: ${formatStorage(file.size)} 필요, ${formatStorage(storageCheckResult.availableSpace)} 사용 가능`;

        setStorageDialogData({
          required: file.size,
          available: storageCheckResult.availableSpace,
        });
        setShowStorageDialog(true);
        options.onStorageExceeded?.(
          file.size,
          storageCheckResult.availableSpace,
        );

        return {
          success: false,
          error: errorMessage,
        };
      }

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
    [
      uploadCore,
      addTransfer,
      updateProgress,
      setStatus,
      options,
      utils,
      checkStorageCapacity,
    ],
  );

  const uploadFiles = useCallback(
    async (files: File[], uploadOptions: UploadOptions = {}) => {
      if (files.length === 1) {
        return uploadFile(files[0], uploadOptions);
      }

      // 다중 파일 업로드 전 총 용량 체크
      const capacityCheck = checkMultipleFilesCapacity(files);
      if (!capacityCheck.canUpload) {
        const errorMessage = `저장소 용량 부족: ${formatStorage(capacityCheck.totalSize)} 필요, ${formatStorage(capacityCheck.availableSpace)} 사용 가능`;

        setStorageDialogData({
          required: capacityCheck.totalSize,
          available: capacityCheck.availableSpace,
        });
        setShowStorageDialog(true);
        options.onStorageExceeded?.(
          capacityCheck.totalSize,
          capacityCheck.availableSpace,
        );

        if (!options.suppressToast) {
          toast.error(`❌ ${errorMessage}`);
        }

        return [
          {
            status: "rejected" as const,
            reason: new Error(errorMessage),
          },
        ];
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
    [uploadFile, checkMultipleFilesCapacity, options],
  );

  return {
    uploadFile,
    uploadFiles,
    showStorageDialog,
    setShowStorageDialog,
    storageDialogData,
  };
};
