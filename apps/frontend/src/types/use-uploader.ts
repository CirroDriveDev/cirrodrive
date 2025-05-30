/**
 * 업로드 결과 타입 예시
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

export interface UploadResultSuccess {
  success: true;
  file: File;
  fileId: string;
  code?: string;
}

export interface UploadResultError {
  success: false;
  file: File;
  error: string;
}

export type UploadResult = UploadResultSuccess | UploadResultError;

/**
 * 파일 업로드 함수 타입
 *
 * - 파일 업로드 방식을 함수로 추상화합니다.
 * - 다양한 업로드 전략에서 사용됩니다.
 */
export type UseUploader = () => {
  upload: (file: File) => Promise<S3UploadResult>;
};
