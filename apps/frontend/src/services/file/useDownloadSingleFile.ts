import { useState } from "react";
import { toast } from "react-toastify";
import { downloadFileFromUrl } from "#utils/downloadFileFromUrl";
import { trpcClient } from "#app/provider/trpcClient.js";

export interface DownloadSingleFileOptions {
  fileId?: string;
  code?: string;
  name: string;
  onProgress?: (progress: number) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDownloadSingleFile() {
  const [isPending, setIsPending] = useState(false);

  const downloadSingleFile = async (options: DownloadSingleFileOptions) => {
    const { fileId, code, name, onProgress, onSuccess } = options;
    setIsPending(true);
    try {
      const { downloadUrl } =
        await trpcClient.file.download.getDownloadUrl.query({
          fileId,
          code,
        });

      await downloadFileFromUrl({
        url: downloadUrl,
        name,
        onProgress,
      });
      onSuccess?.();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
        options.onError?.(e);
      } else {
        throw e;
      }
    } finally {
      setIsPending(false);
    }
  };

  return { downloadSingleFile, isPending };
}
