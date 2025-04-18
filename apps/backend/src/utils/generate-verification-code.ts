// src/utils/generateVerificationCode.ts
export const generateVerificationCode = (length = 6): string => {
  // 인증 코드로 사용할 숫자 범위를 length에 맞춰 생성
  let result = "";
  const characters = "0123456789"; // 숫자만 사용

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};
