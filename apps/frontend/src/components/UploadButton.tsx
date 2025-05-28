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

export function UploadButton(props: FolderViewProps): JSX.Element {
  const { folderId } = props;
  const { query: entryListQuery } = useEntryList(folderId);
  const { uploadFiles } = useUploadFiles(usePresignedPostUploader);

  async function handleFileSelect(): Promise<void> {
    const files = await selectFile();
    if (!files) return;

    const uploadRequests: UploadRequest[] = Array.from(files).map((file) => ({
      file,
      folderId,
    }));
    await uploadFiles(uploadRequests);
    void entryListQuery.refetch();
  }
  return <Button onClick={handleFileSelect}>업로드</Button>;
}
