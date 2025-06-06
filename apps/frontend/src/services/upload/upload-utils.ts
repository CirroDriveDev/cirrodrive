import { getUploadConfig } from "#config/upload.config.js";

export const UPLOAD_CONFIG = getUploadConfig();

export interface UploadOptions {
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
  folderId?: string;
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  code?: string;
  error?: string;
}

export const shouldUseMultipart = (file: File): boolean => {
  return file.size >= UPLOAD_CONFIG.multipart.threshold;
};

export const createUploadId = (): string => {
  return crypto.randomUUID();
};

export const formatUploadError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.name === "AbortError") return "업로드가 취소되었습니다";
    return error.message;
  }
  return "알 수 없는 오류가 발생했습니다";
};