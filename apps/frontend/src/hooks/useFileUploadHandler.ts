import { type UploadRequest } from "#services/file/useUploadFiles.js";
import { type UploadResult } from "#types/use-uploader.js";

interface UseFileUploadHandlerProps {
  folderId?: string;
  onSuccess?: (fileNames: string[]) => void;
  onError?: (errorFiles: string[]) => void;
  maxFiles?: number;
  useUploadFiles: () => {
    uploadFiles: (uploadRequests: UploadRequest[]) => Promise<void>;
    uploadResults: UploadResult[];
  };
}

export function useFileUploadHandler({
  folderId,
  onSuccess,
  onError,
  maxFiles,
  useUploadFiles,
}: UseFileUploadHandlerProps) {
  const { uploadFiles, uploadResults } = useUploadFiles();

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

    const errorFiles = uploadResults
      .filter((r) => !r.success)
      .map((r) => r.file.name);

    const successFiles = uploadResults
      .filter((r) => r.success)
      .map((r) => r.file.name);

    if (errorFiles.length > 0 && onError) {
      onError(errorFiles);
    }

    if (successFiles.length > 0 && onSuccess) {
      onSuccess(successFiles);
    }
  };

  return { handleFiles };
}
