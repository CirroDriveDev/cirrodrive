import mysql from "mysql2/promise";
import dotenvx from "@dotenvx/dotenvx";

dotenvx.config({ quiet: true });

const Console = {
  log: (message?: string) => {
    process.stdout.write(`${message ?? ""}\n`);
  },

  error: (message?: string) => {
    process.stderr.write(`${message ?? ""}\n`);
  },
};

// RDS 접속 정보 설정
const RDS_CONFIG = {
  user: process.env.RDS_USER || "",
  password: process.env.RDS_PASSWORD || "",
  host: process.env.RDS_HOST || "",
  port: Number(process.env.RDS_PORT) || 3306,
  connectTimeout: 5000, // 5초 타임아웃 설정
};

// 헬스체크할 데이터베이스 목록
const DATABASES = [
  process.env.RDS_DATABASE || "",
  process.env.RDS_SHADOW_DATABASE || "",
];

// 특정 데이터베이스에 대한 헬스체크 수행
async function isDatabaseHealthy(database: string): Promise<boolean> {
  let connection;
  try {
    const config = { ...RDS_CONFIG, database };
    connection = await mysql.createConnection(config);
    const [rows] = await connection.execute("SELECT 1 AS health_check");
    return (rows as any).length > 0;
  } catch (error) {
    Console.error((error as any).message);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 1초 간격으로 RDS 상태를 확인하는 함수
async function healthcheck(): Promise<void> {
  Console.log(`[RDS] 접속 정보:`);
  Console.log(`  - Host: ${RDS_CONFIG.host}`);
  Console.log(`  - User: ${RDS_CONFIG.user}`);
  Console.log(`  - Password: ${"*".repeat(20)}`);
  Console.log(`  - Database: ${DATABASES[0]}`);
  Console.log(`  - Shadow Database: ${DATABASES[1]}`);
  Console.log(`  - Port: ${RDS_CONFIG.port}`);

  Console.log(`[RDS] RDS 상태 확인 중...`);

  let allHealthy = true;

  for (const db of DATABASES) {
    const isHealthy = await isDatabaseHealthy(db);
    if (!isHealthy) {
      allHealthy = false;
      break;
    }
  }

  if (allHealthy) {
    Console.log("[RDS] RDS 상태 확인 성공");
    return;
  }

  Console.error("[RDS] RDS 상태 확인 실패");
  process.exit(1);
}

await healthcheck();
