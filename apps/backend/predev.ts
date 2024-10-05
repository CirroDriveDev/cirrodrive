import { exec } from "node:child_process";

// 컨테이너 이름
const containerName = "database-dev";

// 컨테이너 상태를 확인하는 함수
function checkContainerHealth(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    exec(
      `docker inspect -f {{.State.Health.Status}} ${containerName}`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        if (stderr) {
          reject(new Error(stderr));
          return;
        }

        const healthStatus = stdout.trim();
        resolve(healthStatus === "healthy");
      },
    );
  });
}

// 1초 간격으로 컨테이너 상태를 확인하는 함수
async function waitForContainerHealth(): Promise<void> {
  let healthy = false;
  process.stdout.write("MariaDB 로딩.");

  while (!healthy) {
    healthy = await checkContainerHealth();
    if (!healthy) {
      process.stdout.write(".");
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1000);
      });
    }
  }
  process.stdout.write("\n");
  process.stdout.write("MariaDB 로딩 완료\n");
}

function main(): void {
  exec("npm run compose:dev:up -- database-dev");
  void waitForContainerHealth();
  exec("prisma db push");
}

// 스크립트 실행
main();
