// 업로드 또는 다운로드 타입
export type FileTransferType = "upload" | "download";

// 전송 상태 타입
export type FileTransferStatus =
  | "pending"
  | "inProgress"
  | "success"
  | "error"
  | "cancelled";

// 공통 속성: 업로드와 다운로드 모두에 적용
interface FileTransferBase {
  id: string; // 고유 식별자
  progress: number; // 0~100
  transferredBytes: number; // 전송된 바이트
  totalBytes: number; // 전체 바이트
  status: FileTransferStatus; // 상태값
  error?: string; // 오류 메시지
  retry: () => void; // 재시도 함수
  cancel: () => void; // 취소 함수
  isRetry?: boolean; // 재시도 여부 (옵션)
}

// 업로드 전용 타입
export interface FileUploadItem extends FileTransferBase {
  type: "upload";
  file: File; // 실제 브라우저 File 객체
}

// 다운로드 전용 타입
export interface FileDownloadItem extends FileTransferBase {
  type: "download";
  file: {
    name: string; // 파일 이름
    size: number; // 파일 크기
  };
}

// 업로드 또는 다운로드 둘 중 하나
export type FileTransfer = FileUploadItem | FileDownloadItem;
