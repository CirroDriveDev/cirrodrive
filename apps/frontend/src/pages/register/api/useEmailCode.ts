import { useState, useEffect, useRef } from "react";

export interface UseEmailCodeReturn {
  email: string;
  verificationCode: string;
  handleCodeInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendCode: () => void;
  handleVerifyCode: () => void;
  timer: number;
  cooldown: number;
  isEmailVerified: boolean;
}

export const useEmailCode = (): UseEmailCodeReturn => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
  }, [timer]);

  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
  }, [cooldown]);

  const handleCodeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const { name, value } = e.currentTarget;
    if (name === "email") setEmail(value);
    else if (name === "verificationCode") setVerificationCode(value);
  };

  const handleSendCode = (): void => {
    if (!email) return; //alert("이메일을 입력하세요.");

    // 실제 API 요청으로 대체 필요
    const generatedCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    setServerCode(generatedCode);
    //alert(`이메일로 인증코드 전송: ${generatedCode}`); // 실제 환경에서는 제거

    setTimer(300); // 5분 유효 시간
    setCooldown(30); // 30초 쿨타임
  };

  const handleVerifyCode = (): void => {
    if (verificationCode === serverCode) {
      setIsEmailVerified(true);
      // alert("이메일 인증 성공");
    } else {
      //  alert("인증 코드가 올바르지 않습니다.");
    }
  };

  return {
    email,
    verificationCode,
    handleCodeInputChange,
    handleSendCode,
    handleVerifyCode,
    timer,
    cooldown,
    isEmailVerified,
  };
};
