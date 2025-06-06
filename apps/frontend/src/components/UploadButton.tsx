import { Button } from "#shadcn/components/Button.js";
import { useEntryList } from "#services/useEntryList.js";
import { selectFile } from "#utils/selectFile.js";
import { useUpload } from "#services/upload/useUpload.js";
import { StorageExceededDialog } from "#components/StorageExceededDialog.js";

interface FolderViewProps {
  folderId: string;
}

export function UploadButton({ folderId }: FolderViewProps): JSX.Element {
  const { query: entryListQuery } = useEntryList(folderId);

  const {
    uploadFiles,
    showStorageDialog,
    setShowStorageDialog,
    storageDialogData,
  } = useUpload({
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

  return (
    <>
      {/* 저장소 용량 부족 다이어로그 */}
      {storageDialogData ? (
        <StorageExceededDialog
          open={showStorageDialog}
          onOpenChange={setShowStorageDialog}
          requiredSize={storageDialogData.required}
          availableSize={storageDialogData.available}
        />
      ) : null}
      
      <Button onClick={handleFileSelect}>업로드</Button>
    </>
  );
}
