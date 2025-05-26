#!/usr/bin/env vite-node
/* eslint-disable no-console -- cli */

import { runPrismaCommand } from "#src/utils.js";

async function main() {
  try {
    // 환경 변수 설정
    process.env.NODE_ENV = "development";

    // 명령행 인수 가져오기 (첫 두 개 인수는 node와 스크립트 경로이므로 제외)
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.error("사용법: prisma-env <prisma 명령어>");
      console.error("예시: prisma-env db push");
      process.exit(1);
    }

    // 모든 인수를 공백으로 구분된 하나의 명령어 문자열로 결합
    const command = `prisma ${args.join(" ")}`;

    await runPrismaCommand(command, {
      stdio: "inherit", // 명령어의 출력을 현재 프로세스에 직접 연결
    });
  } catch (error) {
    console.error("오류 발생:", (error as Error).message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("치명적인 오류:", error);
  process.exit(1);
});
