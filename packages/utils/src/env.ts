import { existsSync } from "node:fs";
import { join } from "node:path";
import { config } from "@dotenvx/dotenvx";
import { z } from "zod";

/**
 * 환경 변수 로더 및 검증 유틸리티
 *
 * 이 모듈은 TypeScript 프로젝트에서 환경 변수를 안전하게 로드하고 검증하는 기능을 제공합니다.
 *
 * 주요 특징:
 *
 * - Process.env와 .env 파일의 우선순위 기반 로딩
 * - Zod 스키마를 통한 타입 안전 검증
 * - 환경별(.env.production, .env.development, .env.test) 파일 지원
 * - 메모리 기반 캐싱으로 성능 최적화
 * - 명확한 에러 메시지 제공
 */

// NODE_ENV 값의 유효성 검증을 위한 zod 스키마 정의
const processEnvSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]),
});

// NODE_ENV 타입 추론 ("production" | "development" | "test")
export type MODE = z.infer<typeof processEnvSchema.shape.NODE_ENV>;

/**
 * 시스템 환경 변수 인터페이스 모든 환경 변수 결과에 기본적으로 포함되는 시스템 변수들
 */
export interface SystemEnv {
  /**
   * Node 환경 (production, development, test)
   */
  NODE_ENV: MODE;
  /**
   * Node 환경과 동일 (NODE_ENV 별칭)
   */
  MODE: MODE;
  /**
   * 프로덕션 환경 여부
   */
  PROD: boolean;
  /**
   * 개발 환경 여부 (development 또는 test)
   */
  DEV: boolean;
  /**
   * 테스트 환경 여부
   */
  TEST: boolean;
}

/**
 * 환경 변수 결과 타입
 *
 * 시스템 환경 변수(SystemEnv)와 사용자 정의 환경 변수(T)를 병합한 타입
 */
export type EnvResult<T extends z.AnyZodObject> = SystemEnv & z.infer<T>;

/**
 * 환경 변수 로더 옵션 인터페이스
 */
export interface EnvOptions {
  /**
   * 캐시 사용 여부 (기본값: true)
   */
  cache?: boolean;
  /**
   * .env 파일을 찾을 디렉토리 경로 (기본값: process.cwd())
   */
  envDir?: string;
  /**
   * Dotenvx의 quiet 옵션 (기본값: true)
   */
  quiet?: boolean;
  /**
   * Dotenvx의 debug 옵션 (기본값: false)
   */
  debug?: boolean;
  /**
   * 외부에서 주입할 환경 변수 객체 (기본값: undefined)
   *
   * 주입된 경우 우선순위:
   *
   * 1. `injectedEnv` 2. `process.env` 3. `.env` 파일
   */
  injectedEnv?: Record<string, string | undefined>;
}

/**
 * 메모리 기반 캐시 저장소 키: 스키마 키들과 envDir의 조합 값: 파싱된 환경 변수 결과
 */
const cache = new Map<string, unknown>();

/**
 * 캐시 초기화 함수 주로 테스트에서 각 테스트 케이스 간의 격리를 위해 사용됩니다.
 */
export function clearEnvCache() {
  cache.clear();
}

/**
 * ZodError를 읽기 쉬운 에러 메시지로 변환
 *
 * @param error - 변환할 ZodError 객체
 * @returns 사용자 친화적인 에러 메시지 문자열
 */
function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      return `${path}${issue.message}`;
    })
    .join("; ");
}

/**
 * 환경 변수를 파싱하고 검증하는 메인 함수
 *
 * 이 함수는 다음 순서로 환경 변수를 처리합니다:
 *
 * 1. NODE_ENV 검증 및 시스템 변수 생성 (NODE_ENV, MODE, PROD, DEV, TEST)
 * 2. 환경별 .env 파일 로드 (.env.production, .env.development, .env.test)
 * 3. 우선순위 적용: 1. `injectedEnv` 2. `process.env` 3. `.env` 파일
 * 4. 사용자 정의 스키마로 환경 변수 검증 및 타입 변환
 * 5. 시스템 변수와 사용자 변수를 병합한 최종 결과 반환
 *
 * @example
 *
 * ```typescript
 * // 기본 사용법
 * const env = getEnv(
 *   z.object({
 *     API_URL: z.string().url(),
 *     PORT: z.coerce.number().default(3000),
 *     DEBUG: z.coerce.boolean().default(false),
 *   }),
 * );
 *
 * // 외부 환경 변수 주입
 * const testEnv = getEnv(
 *   z.object({
 *     API_URL: z.string().url(),
 *     PORT: z.coerce.number(),
 *   }),
 *   {
 *     injectedEnv: {
 *       NODE_ENV: "test",
 *       API_URL: "https://test-api.example.com",
 *       PORT: "4000",
 *     },
 *   },
 * );
 *
 * // env는 다음과 같은 형태입니다:
 * // {
 * //   NODE_ENV: "development",
 * //   MODE: "development",
 * //   PROD: false,
 * //   DEV: true,
 * //   TEST: false,
 * //   API_URL: "https://api.example.com",
 * //   PORT: 3000,
 * //   DEBUG: false
 * // }
 * ```
 *
 * @param schema - 환경 변수 검증을 위한 Zod 스키마 객체
 * @param options - 선택적 설정 옵션
 * @returns 검증된 환경 변수 객체 (시스템 변수 + 사용자 변수)
 * @throws NODE_ENV가 유효하지 않은 경우
 * @throws .env 파일 파싱에 실패한 경우
 * @throws 사용자 스키마 검증에 실패한 경우
 */
export function getEnv<T extends z.AnyZodObject>(
  schema: T,
  options: EnvOptions = {},
): EnvResult<T> {
  // 옵션 기본값 설정
  const {
    cache: useCache = true,
    envDir = process.cwd(),
    quiet = true,
    debug = false,
    injectedEnv,
  } = options;

  // 캐시 키 생성 (스키마의 키들, 디렉토리 경로, 주입된 환경 변수로 고유 식별)
  // 주입된 환경 변수가 있으면 캐시 키에 포함 (주입된 변수가 다르면 다른 캐시 결과)
  const injectedEnvKey = injectedEnv ? JSON.stringify(injectedEnv) : "";
  const cacheKey = `${JSON.stringify(Object.keys(schema.shape as object))}-${envDir}-${injectedEnvKey}`;

  // 캐시된 결과가 있으면 즉시 반환
  if (useCache && cache.has(cacheKey)) {
    return cache.get(cacheKey) as EnvResult<T>;
  }

  try {
    // ============================================================
    // 1. NODE_ENV 검증 및 시스템 변수 생성
    // ============================================================
    const nodeEnvResult = processEnvSchema.safeParse({
      NODE_ENV: injectedEnv?.NODE_ENV ?? process.env.NODE_ENV,
    });
    if (!nodeEnvResult.success) {
      throw new Error(
        `Invalid NODE_ENV: ${formatZodError(nodeEnvResult.error)}`,
      );
    }

    const nodeEnv = nodeEnvResult.data.NODE_ENV;
    // 시스템 환경 변수들 (항상 포함됨)
    const systemEnv = {
      NODE_ENV: nodeEnv,
      MODE: nodeEnv, // MODE는 NODE_ENV와 동일
      PROD: nodeEnv === "production",
      DEV: nodeEnv === "development" || nodeEnv === "test",
      TEST: nodeEnv === "test",
    };

    // ============================================================
    // 2. 환경별 .env 파일 로드 (선택적)
    // ============================================================
    const envFilePath = join(envDir, `.env.${nodeEnv}`);
    let fileEnv: Record<string, string> | undefined;

    if (existsSync(envFilePath)) {
      const result = config({
        path: envFilePath,
        override: false, // process.env를 덮어쓰지 않고 파싱된 결과만 반환
        quiet,
        debug,
      });

      if (result.error) {
        throw result.error;
      }
      fileEnv = result.parsed;
    }

    // ============================================================
    // 3. 우선순위 적용하여 사용자 환경 변수 수집
    // 우선순위: injectedEnv > process.env > .env 파일
    // ============================================================
    const userEnv: Record<string, unknown> = {};
    for (const key of Object.keys(schema.shape as object)) {
      const value = injectedEnv?.[key] ?? process.env[key] ?? fileEnv?.[key];
      if (value !== undefined) {
        userEnv[key] = value;
      }
    }

    // ============================================================
    // 4. 사용자 스키마 검증 및 타입 변환
    // ============================================================
    const userResult = schema.safeParse(userEnv);
    if (!userResult.success) {
      throw new Error(
        `Environment validation failed: ${formatZodError(userResult.error)}`,
      );
    }

    // ============================================================
    // 5. 최종 결과 생성 및 캐시 저장
    // ============================================================
    const finalEnv = { ...systemEnv, ...userResult.data };

    // 성공적으로 파싱된 결과를 캐시에 저장
    if (useCache) {
      cache.set(cacheKey, finalEnv);
    }

    return finalEnv;
  } catch (error) {
    // 에러 발생 시 해당 캐시 항목 제거 (다음 호출 시 재시도 가능)
    if (useCache && cache.has(cacheKey)) {
      cache.delete(cacheKey);
    }
    throw error;
  }
}
