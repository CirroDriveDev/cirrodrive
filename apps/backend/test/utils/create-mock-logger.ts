import type { Logger } from "pino";

/**
 * `Logger` 인터페이스를 모방한 모의 객체를 생성합니다. 이 함수는 테스트 환경에서 로깅 동작을 모의하기 위해 사용됩니다.
 */
export function createMockLogger(): Logger {
  return {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    child: () => createMockLogger(),
  } as unknown as Logger;
}
