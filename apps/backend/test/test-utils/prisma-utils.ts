import { spawn } from "cross-spawn";
import which from "npm-which";
import { getProjectRoot } from "@/utils/get-project-root.ts";

const projectRoot = getProjectRoot();
const databasePath = `${projectRoot}/apps/database`;

async function runPrismaCommand(command: string): Promise<void> {
  if (import.meta.env.MODE !== "test") {
    throw new Error("This function should only be used in test environment");
  }
  const prismaBin = which(process.cwd()).sync("dotenvx");

  const args = [
    "run",
    "-f",
    `${databasePath}/.env.test`,
    "--",
    "pnpx",
    ...command.split(" "),
    "--schema",
    `${databasePath}/prisma`,
  ];
  await new Promise((res, rej) => {
    const prismaProcess = spawn(prismaBin, args, {
      stdio: "inherit",
    });
    prismaProcess.on("exit", (code) => {
      if (code === 0) {
        res(0);
      } else {
        const error = new Error(
          `Prisma command failed with exit code ${code}\nCommand: ${prismaBin} ${args.join(" ")}`,
        );
        rej(error);
      }
    });
    prismaProcess.on("error", (err) => {
      rej(
        new Error(
          `Failed to spawn Prisma process: ${err.message}\nCommand: ${prismaBin} ${args.join(" ")}`,
        ),
      );
    });
  });
}

export async function clearDatabase(): Promise<void> {
  const command = "prisma db push --force-reset --skip-generate";
  await runPrismaCommand(command);
}
