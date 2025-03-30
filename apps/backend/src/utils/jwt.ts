import {
  createSecretKey as cryptoCreateSecretKey,
  type KeyObject,
} from "node:crypto";

/**
 * JWT 비밀키를 생성합니다. 환경 변수 `VITE_JWT_SECRET`에서 비밀키를 가져오며, 없을 경우 기본값을 사용합니다.
 *
 * @returns KeyObject - 암호화 키 객체
 */
export function createSecretKey(): KeyObject {
  return cryptoCreateSecretKey(
    Buffer.from(import.meta.env.VITE_JWT_SECRET || "default_secret", "utf-8"),
  );
}
