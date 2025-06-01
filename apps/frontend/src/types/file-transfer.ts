export type FileTransferType = "upload" | "download";
export type FileTransferStatus =
  | "pending"
  | "inProgress"
  | "success"
  | "error"
  | "cancelled";

interface FileTransferBase {
  id: string;
  progress: number;
  transferredBytes: number;
  totalBytes: number;
  status: FileTransferStatus;
  error?: string;
  retry: () => void;
  cancel: () => void;
}

export interface FileUploadItem extends FileTransferBase {
  type: "upload";
  file: File;
}

export interface FileDownloadItem extends FileTransferBase {
  type: "download";
  file: {
    name: string;
    size: number;
  };
}

export type FileTransfer = FileUploadItem | FileDownloadItem;
