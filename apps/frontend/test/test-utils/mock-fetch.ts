/**
 * 네트워크 요청 모킹 유틸리티
 */
import { vi } from 'vitest';

interface MockFetchOptions {
  delay?: number;
  failureRate?: number; // 0-1 사이의 실패율
  shouldFail?: boolean;
  statusCode?: number;
  responseData?: unknown;
}

/**
 * fetch를 모킹하여 다양한 네트워크 시나리오를 시뮬레이션합니다.
 */
export function createMockFetch(options: MockFetchOptions = {}) {
  const {
    delay = 0,
    failureRate = 0,
    shouldFail = false,
    statusCode = 200,
    responseData = {},
  } = options;

  return vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
    // 지연 시뮬레이션
    if (delay > 0) {
      await new Promise<void>(resolve => {
        setTimeout(resolve, delay);
      });
    }

    // 랜덤 실패 시뮬레이션
    if (failureRate > 0 && Math.random() < failureRate) {
      throw new Error('Network error (simulated)');
    }

    // 강제 실패 시뮬레이션
    if (shouldFail) {
      throw new Error('Network error (forced)');
    }

    // PUT 요청 (파트 업로드) 시뮬레이션
    if (init?.method === 'PUT') {
      return new Response(null, {
        status: statusCode,
        headers: {
          'ETag': `"mock-etag-${  Date.now()  }"`,
        },
      });
    }

    // 일반 응답
    return new Response(JSON.stringify(responseData), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });
}

/**
 * 점진적으로 느려지는 네트워크를 시뮬레이션합니다.
 */
export function createProgressiveSlowFetch(initialDelay = 100, increment = 50) {
  let currentDelay = initialDelay;

  return vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
    await new Promise<void>(resolve => {
      setTimeout(resolve, currentDelay);
    });
    currentDelay += increment;

    if (init?.method === 'PUT') {
      return new Response(null, {
        status: 200,
        headers: {
          'ETag': `"progressive-etag-${  Date.now()  }"`,
        },
      });
    }

    return new Response('{}', { status: 200 });
  });
}

/**
 * 특정 파트만 실패하는 시나리오를 시뮬레이션합니다.
 */
export function createPartialFailureFetch(failingParts: number[] = [2, 5]) {
  let partCounter = 0;

  return vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    if (init?.method === 'PUT') {
      partCounter++;
      
      if (failingParts.includes(partCounter)) {
        throw new Error(`Part ${partCounter} upload failed`);
      }

      return new Response(null, {
        status: 200,
        headers: {
          'ETag': `"part-${partCounter}-etag"`,
        },
      });
    }

    return new Response('{}', { status: 200 });
  });
}

/**
 * AbortSignal을 시뮬레이션합니다.
 */
export function createMockAbortSignal(shouldAbort = false, abortAfterMs?: number) {
  const signal = {
    aborted: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  if (shouldAbort && abortAfterMs) {
    setTimeout(() => {
      signal.aborted = true;
      // AbortError를 시뮬레이션하기 위해 이벤트 리스너 호출
      const listeners = signal.addEventListener.mock.calls
        .filter((call: unknown[]) => call[0] === 'abort')
        .map((call: unknown[]) => call[1] as () => void);
      
      listeners.forEach(listener => listener());
    }, abortAfterMs);
  }

  return signal as unknown as AbortSignal;
}