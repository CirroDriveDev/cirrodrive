import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  UploadStatsCalculator,
  formatBytes,
  formatSpeed,
  formatTime,
  formatUploadMethod 
} from '#utils/uploadStats.js';

describe('UploadStatsCalculator', () => {
  let calculator: UploadStatsCalculator;
  
  beforeEach(() => {
    vi.useFakeTimers();
    calculator = new UploadStatsCalculator('multipart');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('초기 통계를 올바르게 반환한다', () => {
    const stats = calculator.getCurrentStats();
    
    expect(stats.uploadSpeed).toBe(0);
    expect(stats.estimatedTimeRemaining).toBe(0);
    expect(stats.uploadMethod).toBe('multipart');
    expect(stats.startTime).toBeTypeOf('number');
  });

  test('업로드 속도를 올바르게 계산한다', () => {
    const startTime = Date.now();
    vi.setSystemTime(startTime);
    
    // 1초 후 1MB 업로드
    vi.advanceTimersByTime(1000);
    const stats = calculator.update(1024 * 1024, 10 * 1024 * 1024);
    
    expect(stats.uploadSpeed).toBeCloseTo(1024 * 1024, -3); // ~1MB/s
  });

  test('예상 완료 시간을 올바르게 계산한다', () => {
    const startTime = Date.now();
    vi.setSystemTime(startTime);
    
    // 2초 후 2MB 업로드 (1MB/s 속도)
    vi.advanceTimersByTime(2000);
    const stats = calculator.update(2 * 1024 * 1024, 10 * 1024 * 1024);
    
    // 남은 8MB를 1MB/s로 업로드하면 8초 소요
    expect(stats.estimatedTimeRemaining).toBeCloseTo(8, 0);
  });

  test('progress가 0일 때 예상 시간이 0이다', () => {
    const stats = calculator.update(0, 1024 * 1024);
    
    expect(stats.estimatedTimeRemaining).toBe(0);
  });
});

describe('formatBytes', () => {
  test('바이트를 올바르게 포맷한다', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB');
    expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1.0 TB');
  });
});

describe('formatSpeed', () => {
  test('속도를 올바르게 포맷한다', () => {
    expect(formatSpeed(1024)).toBe('1.0 KB/s');
    expect(formatSpeed(1024 * 1024)).toBe('1.0 MB/s');
    expect(formatSpeed(0)).toBe('0 B/s');
  });
});

describe('formatTime', () => {
  test('시간을 올바르게 포맷한다', () => {
    expect(formatTime(0)).toBe('0초');
    expect(formatTime(30)).toBe('30초');
    expect(formatTime(59)).toBe('59초');
    expect(formatTime(60)).toBe('1분 0초');
    expect(formatTime(90)).toBe('1분 30초');
    expect(formatTime(3600)).toBe('1시간 0분');
    expect(formatTime(3730)).toBe('1시간 2분');
  });

  test('무한값이나 음수에 대해 안전하게 처리한다', () => {
    expect(formatTime(-1)).toBe('계산 중...');
    expect(formatTime(Infinity)).toBe('계산 중...');
    expect(formatTime(NaN)).toBe('계산 중...');
  });
});

describe('formatUploadMethod', () => {
  test('업로드 방식을 올바르게 포맷한다', () => {
    expect(formatUploadMethod('presigned-post')).toBe('일반 업로드');
    expect(formatUploadMethod('multipart')).toBe('분할 업로드');
  });
});