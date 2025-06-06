import type { UploadStats } from "#types/file-transfer.js";

/**
 * 업로드 통계를 계산하는 유틸리티 클래스
 */
export class UploadStatsCalculator {
  private startTime: number;
  private lastProgressTime: number;
  private lastTransferredBytes: number;
  private uploadMethod: "presigned-post" | "multipart";

  constructor(uploadMethod: "presigned-post" | "multipart") {
    this.startTime = Date.now();
    this.lastProgressTime = this.startTime;
    this.lastTransferredBytes = 0;
    this.uploadMethod = uploadMethod;
  }

  /**
   * 진행률 업데이트 시 통계를 계산합니다.
   */
  update(transferredBytes: number, totalBytes: number): UploadStats {
    const now = Date.now();
    const timeDiff = (now - this.lastProgressTime) / 1000; // seconds
    const bytesDiff = transferredBytes - this.lastTransferredBytes;

    // 업로드 속도 계산 (최근 진행률 기준)
    let uploadSpeed = 0;
    if (timeDiff > 0) {
      uploadSpeed = bytesDiff / timeDiff;
    }

    // 전체 평균 속도로 예상 시간 계산
    const totalTimeDiff = (now - this.startTime) / 1000;
    const averageSpeed = totalTimeDiff > 0 ? transferredBytes / totalTimeDiff : 0;
    const remainingBytes = totalBytes - transferredBytes;
    const estimatedTimeRemaining = averageSpeed > 0 ? remainingBytes / averageSpeed : 0;

    // 다음 계산을 위해 값 업데이트
    this.lastProgressTime = now;
    this.lastTransferredBytes = transferredBytes;

    return {
      uploadSpeed,
      estimatedTimeRemaining,
      startTime: this.startTime,
      lastProgressTime: now,
      uploadMethod: this.uploadMethod,
    };
  }

  /**
   * 현재 통계를 반환합니다.
   */
  getCurrentStats(): UploadStats {
    return {
      uploadSpeed: 0,
      estimatedTimeRemaining: 0,
      startTime: this.startTime,
      lastProgressTime: this.lastProgressTime,
      uploadMethod: this.uploadMethod,
    };
  }
}

/**
 * 바이트를 읽기 쉬운 형태로 포맷합니다.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  // For bytes, don't show decimal places
  if (i === 0) {
    return `${Math.round(value)} ${sizes[i]}`;
  }

  return `${value.toFixed(1)} ${sizes[i]}`;
}

/**
 * 속도를 읽기 쉬운 형태로 포맷합니다.
 */
export function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`;
}

/**
 * 시간을 읽기 쉬운 형태로 포맷합니다.
 */
export function formatTime(seconds: number): string {
  if (seconds < 0 || !isFinite(seconds)) return "계산 중...";
  
  if (seconds < 60) {
    return `${Math.round(seconds)}초`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}분 ${remainingSeconds}초`;
  } 
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}시간 ${minutes}분`;
  
}

/**
 * 업로드 방식을 한국어로 포맷합니다.
 */
export function formatUploadMethod(method: "presigned-post" | "multipart"): string {
  return method === "multipart" ? "분할 업로드" : "일반 업로드";
}