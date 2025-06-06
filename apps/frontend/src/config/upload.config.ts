/**
 * 파일 업로드 관련 설정값들을 중앙화한 설정 파일
 */

export interface UploadConfig {
  multipart: {
    chunkSize: number;
    maxConcurrency: number;
    maxRetries: number;
    threshold: number;
  };
  presignedPost: {
    maxFileSize: number;
  };
  retry: {
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };
}

export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  multipart: {
    chunkSize: 5 * 1024 * 1024,      // 5MB 청크 크기
    maxConcurrency: 3,               // 최대 3개 청크 동시 업로드
    maxRetries: 3,                   // 청크별 최대 3회 재시도
    threshold: 100 * 1024 * 1024,    // 100MB 이상 파일에서 멀티파트 업로드 사용
  },
  presignedPost: {
    maxFileSize: 100 * 1024 * 1024,  // Presigned POST 최대 파일 크기 (100MB)
  },
  retry: {
    baseDelay: 1000,                 // 기본 재시도 지연 시간 (1초)
    maxDelay: 30000,                 // 최대 재시도 지연 시간 (30초)
    backoffMultiplier: 2,            // 지수 백오프 배수
  },
} as const;

/**
 * 업로드 설정을 반환합니다. 모든 환경에서 동일한 값을 사용합니다.
 */
export const getUploadConfig = (): UploadConfig => {
  return DEFAULT_UPLOAD_CONFIG;
};