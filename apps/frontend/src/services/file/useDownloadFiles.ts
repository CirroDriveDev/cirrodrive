import { useState } from "react";
import pLimit from "p-limit";
import {
  useDownloadSingleFile,
  type DownloadSingleFileOptions,
} from "./useDownloadSingleFile";

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
  const { downloadSingleFile } = useDownloadSingleFile();

  const downloadFiles = async (options: DownloadFilesOptions) => {
    setIsPending(true);
    setErrors([]);
    const limit = pLimit(3);
    const errorList: Error[] = [];
    await Promise.all(
      options.files.map((fileOpt, idx) =>
        limit(async () => {
          await downloadSingleFile({
            ...fileOpt,
            onSuccess: () => options.onSingleFileSuccess?.(idx),
            onError: (err) => {
              errorList.push(err);
              options.onSingleFileError?.(idx, err);
            },
          });
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
