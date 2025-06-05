import { useState } from "react";
import { toast } from "react-toastify";
import { downloadFileFromUrl } from "#utils/downloadFileFromUrl";
import { trpcClient } from "#app/provider/trpcClient.js";
import { useTransferStore } from "#store/useTransferStore.js";
import type { FileDownloadItem } from "#types/file-transfer.js";

export interface DownloadSingleFileOptions {
  fileId?: string;
  code?: string;
  name: string;
  size?: number;
  onProgress?: (progress: number) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

function generateSimpleId(): string {
  return `dl-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

export function useDownloadSingleFile() {
  const [isPending, setIsPending] = useState(false);
  const {
    addTransfer,
    updateProgress,
    setStatus,
    removeTransfer,
  } = useTransferStore();

  const downloadSingleFile = async (options: DownloadSingleFileOptions): Promise<void> => {
    const { fileId, code, name, size, onProgress, onSuccess, onError } = options;
    const controller = new AbortController();
    const id = generateSimpleId();

    const transfer: FileDownloadItem = {
      id,
      file: { name, size: size ?? 0 },
      type: "download",
      progress: 0,
      transferredBytes: 0,
      totalBytes: size ?? 0,
      status: "pending",
      cancel: () => controller.abort(),
      retry: () => {
        removeTransfer(id);
        void downloadSingleFile(options);
      },
    };

    addTransfer(transfer);
    setIsPending(true);
    setStatus(id, "inProgress");

    try {
      const { downloadUrl } = await trpcClient.file.download.getDownloadUrl.query({
        fileId,
        code,
      });

      await downloadFileFromUrl({
        url: downloadUrl,
        name,
        signal: controller.signal,
        onProgress: (p) => {
          updateProgress(id, p * 100);
          onProgress?.(p);
        },
      });

      setStatus(id, "success");
      onSuccess?.();
    } catch (e) {
      const error = e instanceof Error ? e : new Error("Unknown error during download");
      setStatus(id, "error", error.message);
      toast.error(error.message);
      onError?.(error);
    } finally {
      setIsPending(false);
    }
  };

  return { downloadSingleFile, isPending };
}
