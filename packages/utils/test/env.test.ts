/* eslint-disable turbo/no-undeclared-env-vars -- test */
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { getEnv, clearEnvCache } from "#env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 상수 정의
const TEMP_DIR = join(__dirname, "__envtest__");
const VALID_DATABASE_URL = "mysql://user:pass@localhost:3306/database";
const INVALID_DATABASE_URL = "not-a-url";

// 테스트 환경 준비 함수들
const createEnvFileContent = (object: Record<string, string>) =>
  `${Object.entries(object)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")}\n`;

const writeEnvFile = (mode: string, content: Record<string, string>) => {
  const filePath = join(TEMP_DIR, `.env.${mode}`);
  writeFileSync(filePath, createEnvFileContent(content));
};

const setupTempDir = () => {
  rmSync(TEMP_DIR, { recursive: true, force: true });
  mkdirSync(TEMP_DIR, { recursive: true });
};

const setNodeEnv = (mode: string) => (process.env.NODE_ENV = mode);
const setDatabaseUrl = (url: string) => (process.env.DATABASE_URL = url);
const unsetDatabaseUrl = () => delete process.env.DATABASE_URL;

const originalProcessEnv = { ...process.env };

describe("env.ts", () => {
  // 테스트 시작 전에 임시 디렉토리 생성
  beforeAll(() => {
    mkdirSync(TEMP_DIR, { recursive: true });
  });

  // 각 테스트 전에 환경 초기화
  beforeEach(() => {
    setupTempDir(); // 임시 디렉토리 초기화
    clearEnvCache(); // 환경 변수 캐시 초기화
    setNodeEnv("test"); // NODE_ENV 기본값 설정
    unsetDatabaseUrl(); // DATABASE_URL 제거
  });

  // 모든 테스트 종료 후 정리
  afterAll(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true }); // 임시 디렉토리 삭제
    process.env = originalProcessEnv; // 원래 process.env 복원
  });

  // 핵심 시나리오만 테스트
  test.each`
    scenario                              | processEnv              | fileEnv                 | shouldSucceed
    ${"process.env가 파일보다 우선 적용"} | ${VALID_DATABASE_URL}   | ${INVALID_DATABASE_URL} | ${true}
    ${"파일에서 환경 변수 로드"}          | ${undefined}            | ${VALID_DATABASE_URL}   | ${true}
    ${"둘 다 없을 때 실패"}               | ${undefined}            | ${undefined}            | ${false}
    ${"process.env 무효하면 실패"}        | ${INVALID_DATABASE_URL} | ${undefined}            | ${false}
    ${"파일 무효하면 실패"}               | ${undefined}            | ${INVALID_DATABASE_URL} | ${false}
  `("환경 변수 로딩: $scenario", (args) => {
    const { processEnv, fileEnv, shouldSucceed } = args as {
      processEnv: string | undefined;
      fileEnv: string | undefined;
      shouldSucceed: boolean;
    };

    // Arrange: 테스트 환경 설정
    const envSchema = z.object({
      DATABASE_URL: z.string().url(),
    });

    if (processEnv) {
      setDatabaseUrl(processEnv);
    }

    if (fileEnv) {
      writeEnvFile("test", { DATABASE_URL: fileEnv });
    }

    // Act & Assert: 성공/실패 시나리오 검증
    if (shouldSucceed) {
      // Act: 환경 변수 로드
      const env = getEnv(envSchema, { envDir: TEMP_DIR });

      // Assert: 결과 검증
      expect(env.MODE).toBe("test");
      expect(env.DATABASE_URL).toBe(VALID_DATABASE_URL);
    } else {
      // Act: 환경 변수 로드 함수 정의 (실행은 Assert에서)
      const action = () => getEnv(envSchema, { envDir: TEMP_DIR });

      // Assert: 예외 발생 확인
      expect(action).toThrow();
    }
  });

  describe("에러 케이스 상세 검증", () => {
    test("스키마 검증 실패 시 명확한 에러 메시지", () => {
      // Arrange: 유효하지 않은 환경 변수 설정
      const envSchema = z.object({
        DATABASE_URL: z.string().url(),
        PORT: z.number(),
      });

      setDatabaseUrl("invalid-url");
      process.env.PORT = "not-a-number";

      // Act: 유효하지 않은 환경 변수로 함수 호출 준비
      const validateEnv = () => getEnv(envSchema, { envDir: TEMP_DIR });

      // Assert: 예상된 에러 패턴 확인
      expect(validateEnv).toThrow(/Invalid url|Expected number/);
    });

    test("필수 필드 누락 시 에러", () => {
      // Arrange: 필수 필드가 있는 스키마 정의
      const envSchema = z.object({
        REQUIRED_FIELD: z.string(),
      });

      // Act: 필수 필드가 누락된 환경으로 함수 호출 준비
      const validateEnv = () => getEnv(envSchema, { envDir: TEMP_DIR });

      // Assert: 필수 필드 누락 관련 에러 확인
      expect(validateEnv).toThrow(/Required/);
    });
  });

  describe("캐시 동작", () => {
    test("동일한 스키마와 디렉토리는 캐시 사용", () => {
      // Arrange: 스키마 정의 및 환경 변수 설정
      const envSchema = z.object({
        DATABASE_URL: z.string().url(),
      });
      setDatabaseUrl(VALID_DATABASE_URL);

      // Act: 동일한 스키마와 옵션으로 두 번 호출
      const env1 = getEnv(envSchema, { envDir: TEMP_DIR });
      const env2 = getEnv(envSchema, { envDir: TEMP_DIR });

      // Assert: 두 결과가 동일한 객체 참조인지 확인
      expect(env1).toBe(env2); // 동일한 객체 참조
    });

    test("다른 스키마는 별도 캐시", () => {
      // Arrange: 서로 다른 두 스키마 정의 및 환경 변수 설정
      const schema1 = z.object({ DATABASE_URL: z.string().url() });
      const schema2 = z.object({ API_KEY: z.string() });
      setDatabaseUrl(VALID_DATABASE_URL);
      process.env.API_KEY = "test-key";

      // Act: 서로 다른 스키마로 호출
      const env1 = getEnv(schema1, { envDir: TEMP_DIR });
      const env2 = getEnv(schema2, { envDir: TEMP_DIR });

      // Assert: 두 결과가 다른 객체인지 확인
      expect(env1).not.toBe(env2);
    });

    test("cache: false 옵션으로 캐시 비활성화", () => {
      // Arrange: 스키마 정의 및 환경 변수 설정
      const envSchema = z.object({
        DATABASE_URL: z.string().url(),
      });
      setDatabaseUrl(VALID_DATABASE_URL);

      // Act: cache: false 옵션으로 두 번 호출
      const env1 = getEnv(envSchema, { envDir: TEMP_DIR, cache: false });
      const env2 = getEnv(envSchema, { envDir: TEMP_DIR, cache: false });

      // Assert: 서로 다른 객체지만 내용은 동일한지 확인
      expect(env1).not.toBe(env2); // 다른 객체 참조
      expect(env1).toEqual(env2); // 내용은 동일
    });
  });

  describe("NODE_ENV 파싱", () => {
    test.each`
      mode             | PROD     | DEV      | TEST
      ${"production"}  | ${true}  | ${false} | ${false}
      ${"development"} | ${false} | ${true}  | ${false}
      ${"test"}        | ${false} | ${true}  | ${true}
    `("NODE_ENV=$mode일 때 메타데이터 생성", (args) => {
      const { mode, PROD, DEV, TEST } = args as {
        mode: string;
        PROD: boolean;
        DEV: boolean;
        TEST: boolean;
      };

      // Arrange: NODE_ENV 설정
      setNodeEnv(mode);
      const envSchema = z.object({});

      // Act: 환경 변수 로드
      const env = getEnv(envSchema, { envDir: TEMP_DIR });

      // Assert: 시스템 환경 변수 값 확인
      expect(env.MODE).toBe(mode);
      expect(env.PROD).toBe(PROD);
      expect(env.DEV).toBe(DEV);
      expect(env.TEST).toBe(TEST);
    });

    test("잘못된 NODE_ENV는 에러 발생", () => {
      // Arrange: 유효하지 않은 NODE_ENV 설정
      setNodeEnv("invalid-mode");
      const envSchema = z.object({});

      // Act: 유효하지 않은 NODE_ENV로 함수 호출 준비
      const validateEnv = () => getEnv(envSchema, { envDir: TEMP_DIR });

      // Assert: 에러 발생 확인
      expect(validateEnv).toThrow();
    });
  });

  describe("파일 시스템 엣지 케이스", () => {
    test("잘못된 형식의 .env 파일은 에러", () => {
      // Arrange: 스키마 정의 및 잘못된 형식의 .env 파일 생성
      const envSchema = z.object({
        DATABASE_URL: z.string().url(),
      });

      writeFileSync(
        join(TEMP_DIR, ".env.test"),
        "INVALID\nFORMAT\nWITHOUT\nEQUALS",
      );

      // Act: 잘못된 형식의 .env 파일로 함수 호출 준비
      const validateEnv = () => getEnv(envSchema, { envDir: TEMP_DIR });

      // Assert: 에러 발생 확인
      expect(validateEnv).toThrow();
    });

    test("빈 .env 파일은 정상 동작", () => {
      // Arrange: 스키마 정의, process.env 설정 및 빈 .env 파일 생성
      const envSchema = z.object({
        DATABASE_URL: z.string().url(),
      });

      setDatabaseUrl(VALID_DATABASE_URL);
      writeFileSync(join(TEMP_DIR, ".env.test"), "");

      // Act: 환경 변수 로드
      const env = getEnv(envSchema, { envDir: TEMP_DIR });

      // Assert: process.env의 값이 적용되는지 확인
      expect(env.DATABASE_URL).toBe(VALID_DATABASE_URL);
    });
  });

  describe("외부 환경 변수 주입", () => {
    test("injectedEnv가 가장 높은 우선순위", () => {
      // Arrange: 각 소스에 서로 다른 유효한 URL 설정
      const envSchema = z.object({
        DATABASE_URL: z.string().url(),
      });

      const processEnvUrl = "mysql://process:pass@localhost:3306/db1";
      const fileEnvUrl = "mysql://file:pass@localhost:3306/db2";
      const injectedEnvUrl = "mysql://injected:pass@localhost:3306/db3";

      // process.env 설정
      setDatabaseUrl(processEnvUrl);

      // 파일 환경 설정
      writeEnvFile("test", { DATABASE_URL: fileEnvUrl });

      // Act & Assert 1: 주입된 환경 변수가 최우선 적용
      const env1 = getEnv(envSchema, {
        envDir: TEMP_DIR,
        injectedEnv: { DATABASE_URL: injectedEnvUrl },
      });
      expect(env1.DATABASE_URL).toBe(injectedEnvUrl);

      // Act & Assert 2: injectedEnv 없으면 process.env 우선
      const env2 = getEnv(envSchema, { envDir: TEMP_DIR });
      expect(env2.DATABASE_URL).toBe(processEnvUrl);

      // Arrange 3: process.env 제거
      // 완전히 확실하게 process.env.DATABASE_URL 제거
      process.env.DATABASE_URL = undefined;
      delete process.env.DATABASE_URL;

      // 환경 변수 캐시 초기화 (이전 결과가 캐시되어 있을 수 있음)
      clearEnvCache();

      // Act 3: 환경 변수 로드
      const env3 = getEnv(envSchema, { envDir: TEMP_DIR });

      // Assert 3: 파일 환경 변수가 사용되었는지 확인
      expect(env3.DATABASE_URL).toBe(fileEnvUrl);
    });

    test("injectedEnv에서 NODE_ENV 주입", () => {
      // Arrange: 기본 NODE_ENV 설정과 스키마 정의
      const envSchema = z.object({});
      setNodeEnv("development");

      // Act: injectedEnv에 다른 NODE_ENV 값 주입하여 환경 변수 로드
      const env = getEnv(envSchema, {
        envDir: TEMP_DIR,
        injectedEnv: { NODE_ENV: "test" },
      });

      // Assert: injectedEnv의 NODE_ENV 값이 적용되었는지 확인
      expect(env.NODE_ENV).toBe("test");
      expect(env.MODE).toBe("test");
      expect(env.TEST).toBe(true);
      expect(env.DEV).toBe(true);
      expect(env.PROD).toBe(false);
    });

    test("injectedEnv는 캐시 키에 영향", () => {
      // Arrange: 스키마 정의
      const envSchema = z.object({
        VALUE: z.string(),
      });

      // Act: 서로 다른 injectedEnv로 두 번 호출
      const env1 = getEnv(envSchema, {
        envDir: TEMP_DIR,
        injectedEnv: { VALUE: "value1" },
      });

      const env2 = getEnv(envSchema, {
        envDir: TEMP_DIR,
        injectedEnv: { VALUE: "value2" },
      });

      // Assert: 다른 injectedEnv 값으로 인해 다른 캐시 항목이 되어야 함
      expect(env1).not.toBe(env2);
      expect(env1.VALUE).toBe("value1");
      expect(env2.VALUE).toBe("value2");
    });
  });
});
