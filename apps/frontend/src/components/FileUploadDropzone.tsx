import { useState } from "react";
import { FileIcon } from "lucide-react";
import { useDragOverlay } from "#hooks/useDragOverlay.js";
import { useUpload } from "#services/upload/useUpload.js";
import { StorageQuotaAlert } from "#components/StorageQuotaAlert.js";
import { StorageExceededDialog } from "#components/StorageExceededDialog.js";

interface FileUploadDropzoneProps {
  maxFiles?: number;
  folderId?: string;
  onSuccess?: (fileId: string, code: string) => void;
  onError?: (error: string) => void;
}

export function FileUploadDropzone({
  maxFiles = 1,
  folderId,
  onSuccess,
  onError,
}: FileUploadDropzoneProps): JSX.Element {
  const [quotaAlert, setQuotaAlert] = useState<{
    show: boolean;
    message?: string;
    remainingBytes?: number;
  }>({ show: false });

  const handleQuotaError = (error: string) => {
    if (error.includes("저장 공간이 부족합니다")) {
      // 메시지에서 사용 가능한 용량 추출 시도
      const bytesMatch = /(?<bytes>\d+) bytes/.exec(error);
      const remainingBytes =
        bytesMatch?.groups?.bytes ?
          parseInt(bytesMatch.groups.bytes)
        : undefined;

      setQuotaAlert({
        show: true,
        message: error,
        remainingBytes,
      });
    }

    // 기존 에러 핸들러도 호출
    onError?.(error);
  };

  const { 
    uploadFiles, 
    showStorageDialog, 
    setShowStorageDialog, 
    storageDialogData 
  } = useUpload({
    onSuccess,
    onError: handleQuotaError,
  });

  const handleFiles = async (files: FileList | File[]) => {
    if (!files?.length) return;

    let fileArray = Array.from(files);
    if (maxFiles && fileArray.length > maxFiles) {
      fileArray = fileArray.slice(0, maxFiles);
    }

    await uploadFiles(fileArray, { folderId });
  };

  const { dragOver, handleDragOver, handleDragLeave, handleDrop } =
    useDragOverlay({
      onDrop: async (files) => {
        await handleFiles(files);
      },
    });

  return (
    <div className="space-y-4">
      {/* 저장소 용량 부족 다이어로그 */}
      {storageDialogData ? <StorageExceededDialog
          open={showStorageDialog}
          onOpenChange={setShowStorageDialog}
          requiredSize={storageDialogData.required}
          availableSize={storageDialogData.available}
        /> : null}
      
      {/* 할당량 초과 알림 */}
      <StorageQuotaAlert
        isVisible={quotaAlert.show}
        errorMessage={quotaAlert.message}
        remainingBytes={quotaAlert.remainingBytes}
        onDismiss={() => setQuotaAlert({ show: false })}
        onUpgradePlan={() => {
          // 플랜 업그레이드 페이지로 이동
          window.location.href = "/mypage/plans";
        }}
      />

      <form method="post" className="flex flex-col gap-4 bg-background">
        <input
          type="file"
          className="hidden"
          id="file-upload"
          onChange={(event) => {
            const files = event.target.files;
            if (files) {
              void handleFiles(files);
            }
          }}
        />
        <label htmlFor="file-upload">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex h-80 w-96 cursor-pointer flex-col items-center justify-center space-y-4 rounded border-2 border-dashed bg-background text-foreground transition hover:bg-accent hover:text-accent-foreground ${
              dragOver ? "border-blue-500" : "border-gray-300"
            }`}
          >
            <FileIcon className="h-32 w-32 text-blue-500" />
            <p className="text-gray-500">
              파일을 여기에 드래그하거나 클릭하여 선택하세요.
            </p>
          </div>
        </label>
      </form>
    </div>
  );
}
