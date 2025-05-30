import {
  useUploadFiles,
  type UploadRequest,
} from "#services/file/useUploadFiles.js";
import {
  type UploadResultError,
  type UploadResultSuccess,
  type UseUploader,
} from "#types/use-uploader.js";

interface UseFileUploadHandlerOptions {
  folderId?: string;
  onSuccess?: (results: UploadResultSuccess[]) => void;
  onError?: (results: UploadResultError[]) => void;
  onSingleFileSuccess?: (result: UploadResultSuccess) => void;
  onSingleFileError?: (result: UploadResultError) => void;

  maxFiles?: number;
  useUploader: UseUploader;
}

export function useFileUploadHandler(options: UseFileUploadHandlerOptions) {
  const { folderId, maxFiles, useUploader } = options;
  const { uploadFiles, uploadResults } = useUploadFiles({
    useUploader,
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSingleFileSuccess: options.onSingleFileSuccess,
    onSingleFileError: options.onSingleFileError,
  });

  /**
   * 파일 리스트를 받아 업로드를 수행하는 핸들러
   *
   * @param files FileList 또는 File[]
   */
  const handleFiles = async (files: FileList | File[] | null | undefined) => {
    if (!files?.length) return;

    let fileArray = Array.from(files as ArrayLike<File>);
    if (maxFiles && fileArray.length > maxFiles) {
      fileArray = fileArray.slice(0, maxFiles);
    }
    if (!fileArray.length) return;

    const uploadRequests: UploadRequest[] = fileArray.map((file) => ({
      file,
      folderId,
    }));

    await uploadFiles(uploadRequests);
  };

  return {
    handleFiles,
    uploadResults,
  };
}
