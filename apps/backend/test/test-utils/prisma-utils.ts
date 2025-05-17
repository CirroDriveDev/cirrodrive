import { spawn } from "cross-spawn";
import which from "npm-which";
import { getProjectRoot } from "@/utils/get-project-root.ts";

const projectRoot = getProjectRoot();
const databasePath = `${projectRoot}/apps/database`;

async function runPrismaCommand(command: string): Promise<void> {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("This function should only be used in test environment");
  }
  const prismaBin = which(process.cwd()).sync("pnpx");

  const args = `${command} --schema ${databasePath}/prisma`.split(" ");
  await new Promise((res, rej) => {
    const prismaProcess = spawn(prismaBin, args, {
      stdio: "inherit",
    });
    prismaProcess.on("exit", (code) =>
      code === 0 ? res(0) : rej(new Error(String(code))),
    );
  });
}

export async function clearDatabase(): Promise<void> {
  const command = "prisma db push --force-reset --skip-generate";
  await runPrismaCommand(command);
}
