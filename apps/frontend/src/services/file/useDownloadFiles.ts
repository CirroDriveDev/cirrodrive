import { useState } from "react";
import pLimit from "p-limit";
import { trpcClient } from "#app/provider/trpcClient";
import { downloadFileFromUrl } from "#utils/downloadFileFromUrl";
import { useTransferStore } from "#store/useTransferStore";
import type { DownloadSingleFileOptions } from "./useDownloadSingleFile";

export interface DownloadFilesOptions {
  files: DownloadSingleFileOptions[];
  onSuccess?: () => void;
  onError?: (errors: Error[]) => void;
  onSingleFileSuccess?: (index: number) => void;
  onSingleFileError?: (index: number, error: Error) => void;
}

export function useDownloadFiles() {
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<Error[]>([]);
  const { addTransfer, updateProgress, setStatus, removeTransfer } =
    useTransferStore();

  const downloadFiles = async (options: DownloadFilesOptions) => {
    setIsPending(true);
    setErrors([]);
    const limit = pLimit(3);
    const errorList: Error[] = [];

    await Promise.all(
      options.files.map((fileOpt, idx) =>
        limit(async () => {
          const { fileId, name, size, code } = fileOpt;
          const safeSize = size ?? 0; // ✅ undefined 방지
          const controller = new AbortController();
          const transferId = `${fileId}-${Date.now()}`;

          // ✅ 기존 전송 항목 제거
          removeTransfer(transferId);

          // ✅ 상태 등록
          addTransfer({
            id: transferId,
            type: "download",
            file: { name, size: safeSize },
            progress: 0,
            transferredBytes: 0,
            totalBytes: safeSize,
            status: "pending",
            cancel: () => {
              controller.abort();
              setStatus(transferId, "cancelled");
            },
            retry: () => {
              removeTransfer(transferId);
              void downloadFiles({
                files: [fileOpt],
                onSingleFileSuccess: () => options.onSingleFileSuccess?.(idx),
                onSingleFileError: (i, err) =>
                  options.onSingleFileError?.(idx, err),
              });
            },
          });

          try {
            const { downloadUrl } =
              await trpcClient.file.download.getDownloadUrl.query({
                fileId,
                code,
              });

            await downloadFileFromUrl({
              url: downloadUrl,
              name,
              signal: controller.signal,
              onProgress: (progress) => {
                updateProgress(transferId, Math.round(progress * 100));
              },
            });

            setStatus(transferId, "success");
            options.onSingleFileSuccess?.(idx);
          } catch (e) {
            if ((e as Error)?.name === "AbortError") return;

            const err = e instanceof Error ? e : new Error("Unknown error");
            setStatus(transferId, "error", err.message);
            errorList.push(err);
            options.onSingleFileError?.(idx, err);
          }
        }),
      ),
    );

    setErrors(errorList);
    setIsPending(false);

    if (errorList.length === 0) {
      options.onSuccess?.();
    } else {
      options.onError?.(errorList);
    }
  };

  return { downloadFiles, isPending, errors };
}
