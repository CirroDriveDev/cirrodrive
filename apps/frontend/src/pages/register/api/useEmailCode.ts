import { useState, useEffect, useRef } from "react";
import { TRPCClientError } from "@trpc/client";
import { trpc } from "@/shared/api/trpc.ts";

export interface UseEmailCodeReturn {
  email: string;
  verificationCode: string;
  handleCodeInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendCode: () => Promise<void>;
  handleVerifyCode: () => Promise<void>;
  timer: number;
  cooldown: number;
  isEmailVerified: boolean;
  sendError?: string;
  verifyError?: string;
  reset: () => void;
}

export const useEmailCode = (): UseEmailCodeReturn => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendError, setSendError] = useState<string>();
  const [verifyError, setVerifyError] = useState<string>();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const sendCodeMutation = trpc.email.sendVerification.useMutation();
  const verifyCodeMutation = trpc.email.verifyCode.useMutation();

  useEffect((): (() => void) => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    }
    return (): void => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer]);

  useEffect((): (() => void) => {
    if (cooldown > 0) {
      cooldownRef.current = setTimeout(
        () => setCooldown((prev) => prev - 1),
        1000,
      );
    }
    return (): void => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, [cooldown]);

  const handleCodeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const { name, value } = e.currentTarget;
    if (name === "email") setEmail(value);
    else if (name === "verificationCode") setVerificationCode(value);
  };

  const handleSendCode = async (): Promise<void> => {
    if (!/^[\w-.]+@(?<temp1>[\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setSendError("유효한 이메일을 입력해주세요.");
      return;
    }
    try {
      await sendCodeMutation.mutateAsync({ email });
      setTimer(300);
      setCooldown(30);
      setSendError(undefined);
    } catch (err) {
      if (err instanceof TRPCClientError) {
        setSendError(err.message);
      } else {
        setSendError("인증 코드 전송 중 오류가 발생했습니다.");
      }
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    if (!verificationCode) {
      setVerifyError("인증 코드를 입력해주세요.");
      return;
    }
    if (verificationCode.length !== 6) {
      setVerifyError("인증 코드는 6자리 숫자여야 합니다.");
      return;
    }
    if (isEmailVerified) {
      setVerifyError("이미 인증된 이메일입니다.");
      return;
    }
    if (timer <= 0) {
      setVerifyError("인증 코드의 유효 시간이 만료되었습니다.");
      return;
    }

    try {
      await verifyCodeMutation.mutateAsync({ email, code: verificationCode });
      setIsEmailVerified(true);
      setVerifyError(undefined);
    } catch (err) {
      if (err instanceof TRPCClientError) {
        setVerifyError(err.message);
      } else {
        setVerifyError("인증 확인 중 오류가 발생했습니다.");
      }
    }
  };

  const reset = (): void => {
    setEmail("");
    setVerificationCode("");
    setTimer(0);
    setCooldown(0);
    setIsEmailVerified(false);
    setSendError(undefined);
    setVerifyError(undefined);
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
    sendError,
    verifyError,
    reset,
  };
};
