import { config } from "@dotenvx/dotenvx";
import { z } from "zod";
import { logger as baseLogger } from "@/loaders/logger.loader.ts";
import { getProjectRoot } from "@/utils/get-project-root.ts";

const logger = baseLogger.child({ prefix: "env" });
const projectRoot = getProjectRoot();
const backendPath = `${projectRoot}/apps/backend/`;
const databasePath = `${projectRoot}/apps/database/`;

const envFilePaths = {
  production: [
    `${backendPath}/.env.production`,
    `${databasePath}/.env.production`,
  ],
  development: [
    `${backendPath}/.env.development`,
    `${databasePath}/.env.development`,
  ],
  test: [`${backendPath}/.env.test`, `${databasePath}/.env.test`],
}[import.meta.env.MODE]!;

logger.info(
  `Loading environment variables from [${envFilePaths.map((s) => `"${s}"`).join(", ")}]...`,
);

config({
  path: envFilePaths,
  quiet: true,
});

/**
 * 환경 변수를 검증하기 위한 스키마입니다.
 *
 * 환경 변수를 추가하거나 수정할 때는 이 스키마를 업데이트해야 합니다.
 *
 * 반드시 .env 파일에 값을 설정해야 합니다.
 *
 * @see https://zod.dev/?id=basic-usage
 */
const envSchema = z.object({
  SERVER_PORT: z.coerce.number(),
  CLIENT_PORT: z.coerce.number(),
  DATABASE_URL: z.string().url(),
  EC2_PUBLIC_URL: z.string(),
  JWT_SECRET: z.string(),
  AWS_REGION: z.string(),
  AWS_SES_SOURCE_EMAIL: z.string().email(),
  AWS_S3_BUCKET: z.string(),
});

export const env = envSchema.parse(process.env);

logger.info("Environment variables loaded successfully.");
