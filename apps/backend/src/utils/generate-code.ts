import { randomBytes } from "node:crypto";

// 암호학적으로 안전하고 URL-safe한 코드 생성
export const generateCode = (length = 8): string => {
  // URL-safe: A-Z, a-z, 0-9
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters[bytes[i] % characters.length];
  }
  return result;
};
// 이 함수는 예측 불가능하고, URL-safe하며, 충분히 랜덤한 코드를 생성합니다.
