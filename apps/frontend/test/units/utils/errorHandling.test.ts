import { describe, test, expect } from 'vitest';
import {
  analyzeUploadError,
  isRetryableError,
  getErrorMessage,
  getRecoveryActions,
  calculateRetryDelay,
  extractErrorInfo,
} from '#utils/errorHandling.js';

describe('analyzeUploadError', () => {
  test('AbortError를 올바르게 분석한다', () => {
    const error = new Error('Upload was cancelled');
    error.name = 'AbortError';
    
    const result = analyzeUploadError(error);
    
    expect(result.type).toBe('network_error');
    expect(result.retryable).toBe(false);
    expect(result.userFriendlyMessage).toBe('업로드가 취소되었습니다.');
  });

  test('네트워크 에러를 올바르게 분석한다', () => {
    const error = new Error('fetch failed');
    
    const result = analyzeUploadError(error);
    
    expect(result.type).toBe('network_error');
    expect(result.retryable).toBe(true);
    expect(result.userFriendlyMessage).toContain('네트워크 연결을 확인');
  });

  test('서버 에러를 올바르게 분석한다', () => {
    const error = new Error('Server returned 500 Internal Server Error');
    
    const result = analyzeUploadError(error);
    
    expect(result.type).toBe('server_error');
    expect(result.retryable).toBe(true);
    expect(result.userFriendlyMessage).toContain('서버에 일시적인 문제');
  });

  test('할당량 초과 에러를 올바르게 분석한다', () => {
    const error = new Error('Storage quota exceeded');
    
    const result = analyzeUploadError(error);
    
    expect(result.type).toBe('quota_exceeded');
    expect(result.retryable).toBe(false);
    expect(result.userFriendlyMessage).toContain('저장 공간이 부족');
  });

  test('파일 크기 제한 에러를 올바르게 분석한다', () => {
    const error = new Error('File too large');
    
    const result = analyzeUploadError(error);
    
    expect(result.type).toBe('file_too_large');
    expect(result.retryable).toBe(false);
    expect(result.userFriendlyMessage).toContain('파일 크기가 너무 큽니다');
  });

  test('멀티파트 초기화 실패를 올바르게 분석한다', () => {
    const error = new Error('Failed to initialize multipart upload');
    
    const result = analyzeUploadError(error, 'multipart_init');
    
    expect(result.type).toBe('multipart_init_failed');
    expect(result.retryable).toBe(true);
    expect(result.userFriendlyMessage).toContain('업로드 준비 중 오류');
  });

  test('청크 업로드 실패를 올바르게 분석한다', () => {
    const error = new Error('Part 3 upload failed: 500 Internal Server Error');
    
    const result = analyzeUploadError(error);
    
    expect(result.type).toBe('chunk_upload_failed');
    expect(result.retryable).toBe(true);
    expect(result.partNumber).toBe(3);
    expect(result.userFriendlyMessage).toContain('파일 조각 3 업로드에 실패');
  });

  test('알 수 없는 에러를 올바르게 처리한다', () => {
    const error = new Error('Unknown error');
    
    const result = analyzeUploadError(error);
    
    expect(result.type).toBe('unknown_error');
    expect(result.retryable).toBe(true);
    expect(result.userFriendlyMessage).toContain('알 수 없는 오류');
  });

  test('문자열 에러를 올바르게 처리한다', () => {
    const result = analyzeUploadError('String error message');
    
    expect(result.type).toBe('unknown_error');
    expect(result.message).toBe('String error message');
    expect(result.originalError).toBeUndefined();
  });
});

describe('isRetryableError', () => {
  test('재시도 가능한 에러를 올바르게 판단한다', () => {
    const retryableError = analyzeUploadError(new Error('fetch failed'));
    const nonRetryableError = analyzeUploadError(new Error('Storage quota exceeded'));
    
    expect(isRetryableError(retryableError)).toBe(true);
    expect(isRetryableError(nonRetryableError)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  test('파일명과 함께 에러 메시지를 생성한다', () => {
    const error = analyzeUploadError(new Error('fetch failed'));
    const message = getErrorMessage(error, 'test.txt');
    
    expect(message).toBe('test.txt: 네트워크 연결을 확인하고 다시 시도해주세요.');
  });

  test('파일명 없이 에러 메시지를 생성한다', () => {
    const error = analyzeUploadError(new Error('fetch failed'));
    const message = getErrorMessage(error);
    
    expect(message).toBe('네트워크 연결을 확인하고 다시 시도해주세요.');
  });
});

describe('getRecoveryActions', () => {
  test('네트워크 에러에 대한 복구 액션을 제공한다', () => {
    const error = analyzeUploadError(new Error('fetch failed'));
    const actions = getRecoveryActions(error);
    
    expect(actions).toContain('인터넷 연결 상태를 확인하세요');
    expect(actions).toContain('잠시 후 다시 업로드하세요');
  });

  test('할당량 초과에 대한 복구 액션을 제공한다', () => {
    const error = analyzeUploadError(new Error('Storage quota exceeded'));
    const actions = getRecoveryActions(error);
    
    expect(actions).toContain('불필요한 파일을 삭제하세요');
    expect(actions).toContain('플랜을 업그레이드하세요');
  });

  test('청크 업로드 실패에 대한 복구 액션을 제공한다', () => {
    const error = analyzeUploadError(new Error('Part 1 upload failed'));
    const actions = getRecoveryActions(error);
    
    expect(actions).toContain('다시 시도하면 실패한 부분만 재업로드됩니다');
  });
});

describe('calculateRetryDelay', () => {
  test('지수 백오프 지연 시간을 계산한다', () => {
    // jitter 때문에 정확한 값 대신 범위로 확인
    expect(calculateRetryDelay(1)).toBeGreaterThanOrEqual(900); // 1초 ±10%
    expect(calculateRetryDelay(1)).toBeLessThanOrEqual(1100);
    
    expect(calculateRetryDelay(2)).toBeGreaterThanOrEqual(1800); // 2초 ±10%
    expect(calculateRetryDelay(2)).toBeLessThanOrEqual(2200);
    
    expect(calculateRetryDelay(3)).toBeGreaterThanOrEqual(3600); // 4초 ±10%
    expect(calculateRetryDelay(3)).toBeLessThanOrEqual(4400);
  });

  test('최대 지연 시간을 제한한다', () => {
    const delay = calculateRetryDelay(10);
    expect(delay).toBeGreaterThanOrEqual(27000); // 30초 ±10%
    expect(delay).toBeLessThanOrEqual(33000);
  });

  test('설정된 지연 시간을 사용한다', () => {
    const delay1 = calculateRetryDelay(1);
    const delay2 = calculateRetryDelay(2);
    
    expect(delay1).toBeGreaterThanOrEqual(900); // 1000 - 10% jitter
    expect(delay1).toBeLessThanOrEqual(1100);   // 1000 + 10% jitter
    expect(delay2).toBeGreaterThanOrEqual(1800); // 2000 - 10% jitter
    expect(delay2).toBeLessThanOrEqual(2200);   // 2000 + 10% jitter
  });
});

describe('extractErrorInfo', () => {
  test('에러 정보를 올바르게 추출한다', () => {
    const error = analyzeUploadError(new Error('Test error'));
    const context = { fileSize: 1024, partNumber: 1 };
    
    const info = extractErrorInfo(error, context);
    
    expect(info.type).toBe('unknown_error');
    expect(info.message).toBe('Test error');
    expect(info.retryable).toBe(true);
    expect(info.context).toEqual(context);
    expect(info.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});