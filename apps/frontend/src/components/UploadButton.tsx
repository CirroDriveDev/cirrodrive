import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "#shadcn/components/Button.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#shadcn/components/Dialog.js";
import { Progress } from "#shadcn/components/Progress.js";
import { useEntryList } from "#services/useEntryList.js";
import { selectFile } from "#utils/selectFile.js";
import { usePresignedPostUploader } from "#services/file/presigned-post-uploader.js";

interface FolderViewProps {
  folderId: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  controller: AbortController;
  status: "uploading" | "canceled" | "done" | "error";
}

export function UploadButton({ folderId }: FolderViewProps): JSX.Element {
  const { query: entryListQuery } = useEntryList(folderId);
  const { upload } = usePresignedPostUploader();

  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startUpload = async (file: File, controller: AbortController) => {
    try {
      const result = await upload(file, {
        signal: controller.signal,
        onProgress: (percent) => {
          setFiles((prev) =>
            prev.map((item) =>
              item.file === file ? { ...item, progress: percent } : item,
            ),
          );
        },
      });

      setFiles((prev) =>
        prev.map((item) =>
          item.file === file ?
            {
              ...item,
              status: result.success ? "done" : "error",
            }
          : item,
        ),
      );

      if (result.success) {
        toast.success(`✅ ${file.name} 업로드 성공`);
      } else {
        toast.error(`❌ ${file.name} 업로드 실패`);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        toast.info(`⚠️ ${file.name} 업로드 취소됨`);
      } else {
        toast.error(`❌ ${file.name} 업로드 중 오류 발생`);
      }

      setFiles((prev) =>
        prev.map((item) =>
          item.file === file ? { ...item, status: "canceled" } : item,
        ),
      );
    }
  };

  const handleFileSelect = async () => {
    const selectedFiles = await selectFile();
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const uploadingItems: UploadingFile[] = fileArray.map((file) => ({
      file,
      progress: 0,
      controller: new AbortController(),
      status: "uploading",
    }));

    setFiles(uploadingItems);
    setIsModalOpen(true);

    for (const item of uploadingItems) {
      void startUpload(item.file, item.controller);
    }
  };

  const cancelFile = (file: File) => {
    const target = files.find((f) => f.file === file);
    target?.controller.abort();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFiles([]);
    void entryListQuery.refetch();
  };

  return (
    <>
      <Button onClick={handleFileSelect}>업로드</Button>

      <Dialog open={isModalOpen}>
        <DialogContent className="space-y-4 max-w-xl">
          <DialogHeader>
            <DialogTitle>파일 업로드</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-[300px] overflow-auto">
            {files.map((item) => (
              <div
                key={item.file.name}
                className="flex items-center justify-between space-x-2"
              >
                <div className="flex-1">
                  <p className="text-sm truncate">{item.file.name}</p>
                  <Progress value={item.progress} />
                </div>

                {item.status === "uploading" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => cancelFile(item.file)}
                  >
                    취소
                  </Button>
                )}

                {item.status === "done" && (
                  <span className="text-green-600 text-sm">완료</span>
                )}

                {item.status === "canceled" && (
                  <span className="text-yellow-600 text-sm">취소됨</span>
                )}

                {item.status === "error" && (
                  <span className="text-red-600 text-sm">실패</span>
                )}
              </div>
            ))}
          </div>

          <Button onClick={closeModal} className="w-full">
            닫기
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
