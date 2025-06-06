import { Button } from "#shadcn/components/Button.js";
import { useEntryList } from "#services/useEntryList.js";
import { selectFile } from "#utils/selectFile.js";
import { useUpload } from "#services/upload/useUpload.js";

interface FolderViewProps {
  folderId: string;
}

export function UploadButton({ folderId }: FolderViewProps): JSX.Element {
  const { query: entryListQuery } = useEntryList(folderId);

  const { uploadFiles } = useUpload({
    onSuccess: () => {
      void entryListQuery.refetch();
    },
    onError: () => {
      void entryListQuery.refetch();
    },
  });

  async function handleFileSelect(): Promise<void> {
    const files = await selectFile();
    if (!files) return;

    await uploadFiles(Array.from(files), { folderId });
  }

  return <Button onClick={handleFileSelect}>업로드</Button>;
}
