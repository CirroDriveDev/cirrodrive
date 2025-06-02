import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "cross-spawn";
import which from "npm-which";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 현재 파일의 디렉토리 경로를 구함
// src 디렉토리에서 packages/database 루트로 이동
const databasePath = path.resolve(__dirname, "..");

const envSchema = z.object({
  MODE: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().url(),
});

const env = envSchema.parse({
  MODE: process.env.MODE,
  DATABASE_URL: process.env.DATABASE_URL,
});

export async function runPrismaCommand(
  command: string,
  runOptions: {
    stdio: "inherit" | "ignore" | "pipe";
  } = { stdio: "ignore" },
): Promise<void> {
  const bin = which(process.cwd()).sync("pnpm");
  if (!bin) {
    throw new Error("pnpm not found in PATH");
  }

  const schemaPath = path.join(databasePath, "prisma");
  const options = [...command.split(" "), "--schema", schemaPath];

  await new Promise<void>((res, rej) => {
    const prismaProcess = spawn(bin, options, {
      stdio: runOptions.stdio,
      env: {
        ...process.env,
        DATABASE_URL: env.DATABASE_URL, // env 변수에서 DATABASE_URL을 직접 주입
      },
    });

    prismaProcess.on("exit", (code) => {
      if (code === 0) {
        res();
      } else {
        const error = new Error(
          `Prisma command failed with exit code ${code}\nCommand: ${bin} ${options.join(" ")}`,
        );
        rej(error);
      }
    });

    prismaProcess.on("error", (err) => {
      rej(
        new Error(
          `Failed to spawn Prisma process: ${err.message}\nCommand: ${bin} ${options.join(" ")}`,
        ),
      );
    });
  });
}

export async function clearDatabase(): Promise<void> {
  if (process.env.NODE_ENV !== "test" || env.MODE !== "test") {
    throw new Error("This function should only be used in test environment");
  }

  const command = "prisma db push --force-reset --skip-generate";
  await runPrismaCommand(command);
}
