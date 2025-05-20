import { z } from "zod";
import { getEnv } from "@cirrodrive/utils/env";

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
  APP_SERVER_PORT: z.coerce.number(),
  APP_CLIENT_PORT: z.coerce.number(),
  APP_PUBLIC_HOST: z.string(),
  AUTH_JWT_SECRET: z.string(),
  AUTH_DEFAULT_ADMIN_USERNAME: z.string(),
  AUTH_DEFAULT_ADMIN_PASSWORD: z.string(),
  AWS_REGION: z.string(),
  AWS_SES_SOURCE_EMAIL: z.string().email(),
  AWS_S3_BUCKET: z.string(),
  AWS_S3_ACCESS_KEY: z.string().optional(),
  AWS_S3_SECRET_KEY: z.string().optional(),
  AWS_S3_ENDPOINT: z.string().url().optional(),
  PAYMENT_TOSS_SECRET_KEY: z.string(),
});

export const env = getEnv(envSchema);
