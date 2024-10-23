import { execSync } from "node:child_process";

const Console = {
  log: (message?: string) => {
    process.stdout.write(`${message ?? ""}\n`);
  },

  error: (message?: string) => {
    process.stderr.write(`${message ?? ""}\n`);
  },

  write: (message: string) => {
    process.stdout.write(message);
  },
};

// 컨테이너 이름
const containerName = "database-dev";

// 컨테이너 상태를 확인하는 함수
function checkContainerHealth(): boolean {
  const healthStatus = execSync(
    `docker inspect -f {{.State.Health.Status}} ${containerName}`,
  )
    .toString()
    .trim();

  return healthStatus === "healthy";
}

// 1초 간격으로 컨테이너 상태를 확인하는 함수
async function waitForContainerHealth(): Promise<void> {
  const MAX_COUNT = 30;
  let healthy = false;
  let count = 1;
  Console.write("[MariaDB] 컨테이너 상태 확인 중...");

  while (!healthy) {
    healthy = checkContainerHealth();
    if (!healthy) {
      Console.log(" 실패");
      if (count > MAX_COUNT) {
        Console.error("[MariaDB] 컨테이너 상태 확인 실패");
        process.exit(1);
      }
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1000);
      });
      Console.write(`[MariaDB] 재시도 ${(count++).toString()}회...`);
    } else {
      Console.log(" 성공");
    }
  }
}

async function main(): Promise<void> {
  Console.write("[MariaDB] 실행 중인 개발 서버 종료...");
  execSync("npm run compose:dev:down -- database-dev", { stdio: "ignore" });
  Console.log(" 성공");

  Console.write("[MariaDB] 개발 서버 실행...");
  execSync("npm run compose:dev:up -- database-dev", { stdio: "ignore" });
  Console.log(" 성공");

  await waitForContainerHealth();
  Console.log();

  Console.write("[Docker] DB 컨테이너에 네트워크 연결...");
  execSync("docker network connect jenkins database-dev", { stdio: "inherit" });
  Console.log(" 성공");

  Console.log("[Prisma] db push 실행");
  execSync("prisma db push", { stdio: "inherit" });
  Console.log("[Prisma] 데이터베이스에 스키마 동기화 완료");
}

// 스크립트 실행
void main();
