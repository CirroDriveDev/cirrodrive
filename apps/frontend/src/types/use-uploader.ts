/**
 * 업로드 결과 타입 예시 (S3 응답 결과)
 */
export interface S3UploadResultSuccess {
  success: true;
  file: File;
  key: string;
}

export interface S3UploadResultError {
  success: false;
  file: File;
  error: string;
}

export type S3UploadResult = S3UploadResultSuccess | S3UploadResultError;

/**
 * 최종 업로드 결과 (DB 연동 포함)
 */
export interface UploadResultSuccess {
  success: true;
  file: File;
  fileId: string;
  code?: string;
}

export interface UploadResultError {
  success: false;
  file: File;
}

export type UploadResult = UploadResultSuccess | UploadResultError;

/**
 * 업로더 옵션: 진행률 및 취소 지원
 */
export interface S3UploadOptions {
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
}

/**
 * 파일 업로드 함수 타입
 *
 * - 파일 업로드 전략을 추상화합니다.
 * - Presigned POST, multipart, direct PUT 등 다양한 방식 구현 가능
 */
export type UseUploader = () => {
  upload: (file: File, options?: S3UploadOptions) => Promise<S3UploadResult>;
};
