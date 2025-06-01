import { Button } from "#shadcn/components/Button.js";
import { useEntryList } from "#services/useEntryList.js";
import { selectFile } from "#utils/selectFile.js";
import {
  useUploadFiles,
  type UploadRequest,
} from "#services/file/useUploadFiles.js";
import { usePresignedPostUploader } from "#services/file/presigned-post-uploader.js";

interface FolderViewProps {
  folderId: string;
}

export function UploadButton({ folderId }: FolderViewProps): JSX.Element {
  const { query: entryListQuery } = useEntryList(folderId);

  const { uploadFiles } = useUploadFiles({
    useUploader: usePresignedPostUploader,
    onSuccess: () => {
      void entryListQuery.refetch(); // ✅ 전체 성공 후 재조회
    },
    onError: () => {
      void entryListQuery.refetch(); // ✅ 에러 발생 후에도 반영 가능
    },
  });

  async function handleFileSelect(): Promise<void> {
    const files = await selectFile();
    if (!files) return;

    const uploadRequests: UploadRequest[] = Array.from(files).map((file) => ({
      file,
      folderId,
    }));

    await uploadFiles(uploadRequests);
  }

  return <Button onClick={handleFileSelect}>업로드</Button>;
}
