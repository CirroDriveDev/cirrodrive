import type { Mocked } from "vitest";

/**
 * 지정된 타입 `T`의 모의 객체를 생성합니다. 모든 속성은 자동으로 모의 함수로 대체됩니다. 이는 호출 추적 및 특정 속성에 대한 사용자
 * 정의 구현을 제공할 수 있어 테스트 목적으로 유용합니다.
 *
 * @example
 *
 * ```typescript
 * interface MyService {
 *   fetchData(): Promise<string>;
 * }
 *
 * const mockedService = createMock<MyService>();
 * mockedService.fetchData.mockResolvedValue("mocked data");
 *
 * expect(mockedService.fetchData).toHaveBeenCalled();
 * ```
 *
 * @typeParam T - 모의 객체로 만들 타입입니다.
 * @returns 모든 속성이 모의 함수인 타입 `T`의 모의 객체를 반환합니다.
 */
export function createMock<T>(): Mocked<T> {
  const cache = new Map<string | symbol, unknown>();

  const proxy = new Proxy(
    {},
    {
      get(_target, prop) {
        if (!cache.has(prop)) {
          cache.set(prop, vi.fn());
        }
        return cache.get(prop);
      },
    },
  );

  return proxy as Mocked<T>;
}
