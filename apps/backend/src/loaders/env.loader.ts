import { config } from "@dotenvx/dotenvx";
import { z } from "zod";

config({
  quiet: true,
  ignore: ["MISSING_ENV_FILE"],
});

/**
 * 환경 변수를 검증하기 위한 스키마입니다.
 *
 * 환경 변수를 추가하거나 수정할 때는 이 스키마를 업데이트해야 합니다.
 *
 * 개발 환경에서는 default 값을 사용하고, 배포 환경에서는 반드시 값을 설정해야 합니다.
 *
 * @see https://zod.dev/?id=basic-usage
 */
const envSchema = z.object({
  SERVER_PORT: z.coerce.number().default(3000),
  EC2_PUBLIC_URL: z.string().default("localhost"),
  CLIENT_PORT: z.coerce.number().default(5173),
  JWT_SECRET: z.string().default("dev-secret"),
  AWS_REGION: z.string().default("ap-northeast-2"),
  AWS_SES_SOURCE_EMAIL: z
    .string()
    .email()
    .default("your-verified-email@example.com"),
  AWS_S3_BUCKET: z.string().default("dev-bucket"),
});

export const env = envSchema.parse(process.env);
