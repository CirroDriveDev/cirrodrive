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
export const envSchema = z.object({
  VITE_API_HOST: z.string(),
  VITE_API_PORT: z.string(),
  VITE_TOSS_CLIENT_KEY: z.string(),
});

export const env = import.meta.env as z.infer<typeof envSchema>;
