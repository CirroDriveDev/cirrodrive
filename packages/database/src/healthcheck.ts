import mysql from "mysql2/promise";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
});

const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
});

// DATABASE_URL에서 데이터베이스 이름을 제거하여 서버에만 연결
function getServerUrl(databaseUrl: string): string {
  try {
    const url = new URL(databaseUrl);
    // pathname을 제거하여 데이터베이스 이름 없이 서버에만 연결
    url.pathname = "";
    return url.toString();
  } catch {
    // URL 파싱에 실패하면 원본 반환
    return databaseUrl;
  }
}

interface HealthCheckOptions {
  retries?: number;
  intervalMs?: number;
}

interface HealthCheckResult {
  success: boolean;
  attempts: number;
  error?: string;
  timestamp: string;
}

/**
 * 데이터베이스 연결 상태를 확인합니다.
 *
 * @param options 헬스체크 옵션
 * @returns 헬스체크 결과
 */
export async function healthCheck(
  options: HealthCheckOptions = {},
): Promise<HealthCheckResult> {
  const { retries = 5, intervalMs = 5000 } = options;

  let attempts = 0;
  let lastError: string | undefined;

  for (let i = 0; i < retries; i++) {
    attempts++;

    let connection: mysql.Connection | null = null;
    try {
      // MySQL 서버에 직접 연결 (데이터베이스 이름 제외)
      const serverUrl = getServerUrl(env.DATABASE_URL);
      connection = await mysql.createConnection(serverUrl);

      // 간단한 쿼리로 연결 상태 확인
      await connection.execute("SELECT 1 as healthcheck");

      process.stdout.write(
        `✅ 데이터베이스 연결 성공 (${attempts}/${retries})\n`,
      );

      return {
        success: true,
        attempts,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      lastError = errorMessage;

      process.stdout.write(
        `❌ 데이터베이스 연결 실패 (${attempts}/${retries}): ${errorMessage}\n`,
      );

      // 마지막 시도가 아니라면 대기
      if (i < retries - 1) {
        process.stdout.write(`⏳ ${intervalMs / 1000}초 후 재시도...\n`);
        await new Promise((resolve) => {
          setTimeout(resolve, intervalMs);
        });
      }
    } finally {
      // 연결 정리
      if (connection) {
        await connection.end();
      }
    }
  }

  return {
    success: false,
    attempts,
    error: lastError,
    timestamp: new Date().toISOString(),
  };
}

/**
 * CLI에서 실행되는 헬스체크 함수
 */
export async function runHealthCheck(): Promise<void> {
  process.stdout.write("🔍 데이터베이스 헬스체크를 시작합니다...\n");
  process.stdout.write("📋 설정: 2초 간격으로 30번 확인\n");
  process.stdout.write("\n");

  const result = await healthCheck({
    retries: 30,
    intervalMs: 2000,
  });

  process.stdout.write("\n");
  process.stdout.write("📊 헬스체크 결과:\n");
  process.stdout.write(
    `- 성공 여부: ${result.success ? "✅ 성공" : "❌ 실패"}\n`,
  );
  process.stdout.write(`- 시도 횟수: ${result.attempts}회\n`);
  process.stdout.write(`- 완료 시간: ${result.timestamp}\n`);

  if (result.error) {
    process.stdout.write(`- 오류 메시지: ${result.error}\n`);
  }

  // 실패 시 exit code 1로 종료
  process.exit(result.success ? 0 : 1);
}

// CLI에서 직접 실행되는 경우
if (import.meta.url === `file://${process.argv[1]}`) {
  runHealthCheck().catch((error) => {
    process.stderr.write(`❌ 헬스체크 실행 중 오류 발생: ${error}\n`);
    process.exit(1);
  });
} else if (process.argv[1]?.endsWith("healthcheck.ts")) {
  runHealthCheck().catch((error) => {
    process.stderr.write(`❌ 헬스체크 실행 중 오류 발생: ${error}\n`);
    process.exit(1);
  });
}
