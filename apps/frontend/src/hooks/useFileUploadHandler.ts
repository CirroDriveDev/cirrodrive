import { useCallback } from "react";
import {
  useUploadFiles,
  type UploadRequest,
} from "#services/file/useUploadFiles.js";
import { usePresignedPostUploader } from "#services/file/presigned-post-uploader.js";

interface UseFileUploadHandlerProps {
  folderId?: string;
  onSuccess?: (fileNames: string[]) => void;
  onError?: (errorFiles: string[]) => void;
}

export function useFileUploadHandler({
  folderId,
  onSuccess,
  onError,
}: UseFileUploadHandlerProps) {
  const { uploadFiles, uploadResults } = useUploadFiles(
    usePresignedPostUploader,
  );

  /**
   * 파일 리스트를 받아 업로드를 수행하는 핸들러
   *
   * @param files FileList 또는 File[]
   */
  const handleFiles = useCallback(
    async (files: FileList | File[] | null | undefined) => {
      if (!files?.length) return;

      const fileArray = Array.from(files as ArrayLike<File>);
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
    },
    [folderId, onSuccess, onError, uploadFiles, uploadResults],
  );

  return { handleFiles };
}
