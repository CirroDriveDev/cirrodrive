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
const containerName = "database";

// 컨테이너 상태를 확인하는 함수
function getContainerStatus(): { status: string; healthStatus: string } {
  const status = execSync(
    `docker inspect -f {{.State.Status}} ${containerName}`,
  )
    .toString()
    .trim();
  const healthStatus = execSync(
    `docker inspect -f {{.State.Health.Status}} ${containerName}`,
  )
    .toString()
    .trim();
  return { status, healthStatus };
}

// 1초 간격으로 컨테이너 상태를 확인하는 함수
async function healthcheck(): Promise<void> {
  const MAX_COUNT = 60;
  let count = 1;
  Console.write("[MariaDB] 컨테이너 상태 확인 중...");
  try {
    const { status } = getContainerStatus();
    if (status === "exited") {
      throw new Error("컨테이너가 정지되어 있습니다.");
    }
  } catch (error) {
    Console.log();
    Console.error("[MariaDB] 컨테이너 상태 확인 중 오류 발생");
    Console.error(
      "[MariaDB] 데이터베이스 컨테이너가 정상적으로 실행 중인지 확인하세요.",
    );
    process.exit(1);
  }

  while (getContainerStatus().healthStatus !== "healthy") {
    Console.write(".");
    if (count >= MAX_COUNT) {
      Console.error("[MariaDB] 컨테이너 상태 확인 실패");
      Console.error("[MariaDB] 출력되는 로그를 팀장에게 전달하세요.");
      execSync(`docker logs --tail 1000 ${containerName}`, {
        stdio: "inherit",
      });

      process.exit(1);
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });
    count++;
  }
  Console.log(" 성공");
}

await healthcheck();
