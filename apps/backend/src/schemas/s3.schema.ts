import { z } from "zod";

export const s3PresignedPostSchema = z.object({
  fields: z.object({
    "Content-Type": z
      .string()
      .min(1)
      .describe("업로드 파일의 Content-Type (예: image/png)")
      .regex(/^[-\w.]+\/[\w.+-]+$/, "유효한 MIME 타입이어야 합니다."),
    Policy: z
      .string()
      .min(1)
      .describe("Base64로 인코딩된 S3 정책")
      .regex(/^[A-Za-z0-9+/=]+$/, "Base64 문자열이어야 합니다."),
    "X-Amz-Algorithm": z
      .string()
      .describe("AWS 서명 알고리즘")
      .regex(/^AWS4-HMAC-SHA256$/, "AWS4-HMAC-SHA256이어야 합니다."),
    "X-Amz-Credential": z
      .string()
      .describe("AWS 자격 증명 문자열")
      .regex(
        /^.+\/[0-9]{8}\/[-\w]+\/s3\/aws4_request$/,
        "AWS Credential 형식이어야 합니다.",
      ),
    "X-Amz-Date": z
      .string()
      .describe("ISO8601 형식의 날짜 (예: 20250515T103841Z)")
      .regex(/^[0-9]{8}T[0-9]{6}Z$/, "YYYYMMDDThhmmssZ 형식이어야 합니다."),
    "X-Amz-Signature": z
      .string()
      .describe("SHA256 해시 서명")
      .regex(/^[a-f0-9]{64}$/, "64자리 16진수 문자열이어야 합니다."),
    bucket: z.string().min(1).describe("S3 버킷 이름"),
    key: z.string().min(1).describe("업로드될 객체의 키(경로 포함)"),
  }),
  url: z.string().url().describe("S3 Presigned POST 요청을 보낼 URL"),
});
