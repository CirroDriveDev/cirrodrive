import { getUploadConfig } from "#config/upload.config.js";

/**
 * 업로드 에러 타입 정의
 */
export type UploadErrorType = 
  | "network_error"
  | "server_error" 
  | "quota_exceeded"
  | "file_too_large"
  | "invalid_file_type"
  | "upload_timeout"
  | "chunk_upload_failed"
  | "multipart_init_failed"
  | "multipart_complete_failed"
  | "unknown_error";

/**
 * 업로드 에러 정보
 */
export interface UploadError {
  type: UploadErrorType;
  message: string;
  originalError?: Error;
  retryable: boolean;
  userFriendlyMessage: string;
  partNumber?: number; // 멀티파트 업로드에서 실패한 파트 번호
}

/**
 * 에러를 분석하고 타입을 결정합니다.
 */
export function analyzeUploadError(error: unknown, context?: string): UploadError {
  if (error instanceof Error) {
    // 네트워크 에러
    if (error.name === "AbortError" || error.message.includes("cancelled")) {
      return {
        type: "network_error",
        message: "Upload was cancelled",
        originalError: error,
        retryable: false,
        userFriendlyMessage: "업로드가 취소되었습니다.",
      };
    }

    // 네트워크 연결 문제
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return {
        type: "network_error",
        message: error.message,
        originalError: error,
        retryable: true,
        userFriendlyMessage: "네트워크 연결을 확인하고 다시 시도해주세요.",
      };
    }

    // 청크 업로드 실패 (서버 에러 체크보다 먼저 체크)
    const partMatch = /Part (?<partNumber>\d+)/.exec(error.message);
    if (partMatch) {
      return {
        type: "chunk_upload_failed",
        message: error.message,
        originalError: error,
        retryable: true,
        userFriendlyMessage: `파일 조각 ${partMatch.groups?.partNumber} 업로드에 실패했습니다. 다시 시도해주세요.`,
        partNumber: partMatch.groups?.partNumber ? parseInt(partMatch.groups.partNumber, 10) : undefined,
      };
    }

    // 서버 에러 (HTTP 상태 코드 기반)
    if (error.message.includes("500") || error.message.includes("502") || error.message.includes("503")) {
      return {
        type: "server_error",
        message: error.message,
        originalError: error,
        retryable: true,
        userFriendlyMessage: "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      };
    }

    // 할당량 초과
    if (error.message.includes("quota") || error.message.includes("storage")) {
      return {
        type: "quota_exceeded",
        message: error.message,
        originalError: error,
        retryable: false,
        userFriendlyMessage: "저장 공간이 부족합니다. 불필요한 파일을 삭제하거나 플랜을 업그레이드하세요.",
      };
    }

    // 파일 크기 제한
    if (error.message.includes("size") || error.message.includes("large")) {
      return {
        type: "file_too_large",
        message: error.message,
        originalError: error,
        retryable: false,
        userFriendlyMessage: "파일 크기가 너무 큽니다. 더 작은 파일로 다시 시도해주세요.",
      };
    }

    // 멀티파트 특정 에러들
    if (context === "multipart_init") {
      return {
        type: "multipart_init_failed",
        message: error.message,
        originalError: error,
        retryable: true,
        userFriendlyMessage: "업로드 준비 중 오류가 발생했습니다. 다시 시도해주세요.",
      };
    }

    if (context === "multipart_complete") {
      return {
        type: "multipart_complete_failed",
        message: error.message,
        originalError: error,
        retryable: true,
        userFriendlyMessage: "업로드 완료 중 오류가 발생했습니다. 다시 시도해주세요.",
      };
    }
  }

  // 기본 알 수 없는 에러
  return {
    type: "unknown_error",
    message: error instanceof Error ? error.message : String(error),
    originalError: error instanceof Error ? error : undefined,
    retryable: true,
    userFriendlyMessage: "알 수 없는 오류가 발생했습니다. 다시 시도해주세요.",
  };
}

/**
 * 재시도 가능한 에러인지 확인합니다.
 */
export function isRetryableError(error: UploadError): boolean {
  return error.retryable;
}

/**
 * 사용자에게 보여줄 에러 메시지를 생성합니다.
 */
export function getErrorMessage(error: UploadError, fileName?: string): string {
  const prefix = fileName ? `${fileName}: ` : "";
  return prefix + error.userFriendlyMessage;
}

/**
 * 에러 타입별 복구 제안을 제공합니다.
 */
export function getRecoveryActions(error: UploadError): string[] {
  switch (error.type) {
    case "network_error":
      return [
        "인터넷 연결 상태를 확인하세요",
        "Wi-Fi 또는 모바일 데이터 연결을 다시 시도하세요",
        "잠시 후 다시 업로드하세요"
      ];
    
    case "server_error":
      return [
        "잠시 후 다시 시도하세요",
        "문제가 지속되면 고객 지원팀에 문의하세요"
      ];
    
    case "quota_exceeded":
      return [
        "불필요한 파일을 삭제하세요",
        "플랜을 업그레이드하세요",
        "다른 계정을 사용하세요"
      ];
    
    case "file_too_large":
      return [
        "파일을 압축하거나 분할하세요",
        "더 작은 파일로 다시 시도하세요",
        "플랜을 업그레이드하여 더 큰 파일을 업로드하세요"
      ];
    
    case "chunk_upload_failed":
      return [
        "다시 시도하면 실패한 부분만 재업로드됩니다",
        "네트워크 연결을 확인하세요"
      ];
    
    case "invalid_file_type":
      return [
        "지원되는 파일 형식으로 변환하세요",
        "파일 확장자를 확인하세요"
      ];
    
    case "upload_timeout":
      return [
        "더 안정적인 네트워크 환경에서 다시 시도하세요",
        "작은 파일로 분할하여 업로드하세요"
      ];
    
    case "multipart_init_failed":
      return [
        "잠시 후 다시 시도하세요",
        "네트워크 연결을 확인하세요"
      ];
    
    case "multipart_complete_failed":
      return [
        "업로드를 다시 시도하세요",
        "파일이 손상되지 않았는지 확인하세요"
      ];
    
    case "unknown_error":
    default:
      return [
        "다시 시도하세요",
        "문제가 지속되면 페이지를 새로고침하세요"
      ];
  }
}

/**
 * 재시도 지연 시간을 계산합니다 (지수 백오프).
 */
export function calculateRetryDelay(attemptNumber: number): number {
  const config = getUploadConfig();
  const { baseDelay, maxDelay, backoffMultiplier } = config.retry;
  
  const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attemptNumber - 1), maxDelay);
  
  // 약간의 jitter 추가 (±10%)
  const jitter = delay * 0.1 * (Math.random() - 0.5);
  return Math.round(delay + jitter);
}

/**
 * 에러 로깅을 위한 정보를 추출합니다.
 */
export function extractErrorInfo(error: UploadError, context?: Record<string, unknown>) {
  return {
    type: error.type,
    message: error.message,
    retryable: error.retryable,
    partNumber: error.partNumber,
    stack: error.originalError?.stack,
    context,
    timestamp: new Date().toISOString(),
  };
}