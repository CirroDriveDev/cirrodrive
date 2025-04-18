import {
  createSecretKey as cryptoCreateSecretKey,
  type KeyObject,
} from "node:crypto";
import { env } from "@/loaders/env.ts";

/**
 * JWT 비밀키를 생성합니다. 환경 변수 `VITE_JWT_SECRET`에서 비밀키를 가져오며, 없을 경우 기본값을 사용합니다.
 *
 * @returns KeyObject - 암호화 키 객체
 */
export function createSecretKey(): KeyObject {
  return cryptoCreateSecretKey(Buffer.from(env.JWT_SECRET, "utf-8"));
}
