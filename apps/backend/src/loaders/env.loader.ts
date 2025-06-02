import { z } from "zod";

/**
 * 환경 변수를 검증하기 위한 스키마입니다.
 *
 * 환경 변수를 추가하거나 수정할 때는 이 스키마를 업데이트해야 합니다.
 *
 * 반드시 .env 파일에 값을 설정해야 합니다.
 *
 * @see https://zod.dev/?id=basic-usage
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    MODE: z.enum(["development", "test", "production"]),
    APP_PUBLIC_HOST: z.string(),
    APP_BACKEND_PORT: z.coerce.number(),
    APP_FRONTEND_PORT: z.coerce.number(),
    AUTH_JWT_SECRET: z.string(),
    AWS_REGION: z.string(),
    AWS_SES_SOURCE_EMAIL: z.string().email(),
    AWS_S3_BUCKET: z.string(),
    AWS_CLOUDFRONT_DOMAIN: z.string(),
    AWS_CLOUDFRONT_KEY_PAIR_ID: z.string(),
    AWS_CLOUDFRONT_PRIVATE_KEY: z.string(),
    AWS_CLOUDFRONT_EXPIRES_IN_SECONDS: z.coerce.number().default(3600),
    PAYMENT_TOSS_SECRET_KEY: z.string(),
  })
  .transform((env) => {
    return {
      ...env,
      PROD: env.NODE_ENV === "production",
      DEV: env.NODE_ENV !== "production",
      TEST: env.NODE_ENV === "test",
    };
  });

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  MODE: process.env.MODE,
  APP_PUBLIC_HOST: process.env.APP_PUBLIC_HOST,
  APP_BACKEND_PORT: process.env.APP_BACKEND_PORT,
  APP_FRONTEND_PORT: process.env.APP_FRONTEND_PORT,
  AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,
  AWS_REGION: process.env.AWS_REGION,
  AWS_SES_SOURCE_EMAIL: process.env.AWS_SES_SOURCE_EMAIL,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_CLOUDFRONT_DOMAIN: process.env.AWS_CLOUDFRONT_DOMAIN,
  AWS_CLOUDFRONT_KEY_PAIR_ID: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID,
  AWS_CLOUDFRONT_PRIVATE_KEY: process.env.AWS_CLOUDFRONT_PRIVATE_KEY,
  AWS_CLOUDFRONT_EXPIRES_IN_SECONDS:
    process.env.AWS_CLOUDFRONT_EXPIRES_IN_SECONDS,
  PAYMENT_TOSS_SECRET_KEY: process.env.PAYMENT_TOSS_SECRET_KEY,
});
