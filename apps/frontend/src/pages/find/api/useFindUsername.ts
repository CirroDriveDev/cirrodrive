import React, { useState } from "react";
import { useEmailCode } from "@/pages/register/api/useEmailCode.ts";
import { trpc } from "@/services/trpc.ts";
import { useModalStore } from "@/store/useModalStore.ts";

export interface UseFindUsernameReturn {
  email: string;
  verificationCode: string;
  timer: number;
  cooldown: number;
  isEmailVerified: boolean;
  sendError?: string;
  verifyError?: string;
  submissionError?: string;
  handleCodeInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendCode: () => Promise<void>;
  handleVerifyCode: () => Promise<void>;
  handleFindUsername: () => Promise<void>;
}

// 아이디 찾기 기능 커스텀 훅
export const useFindUsername = (): UseFindUsernameReturn => {
  const {
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
  } = useEmailCode(); // 이메일 인증 관련 상태와 메서드

  const [submissionError, setSubmissionError] = useState<string>(""); // 제출 에러 메시지 상태
  const { openModal } = useModalStore(); // 모달 오픈 함수

  const findUsernameQuery = trpc.user.findUsername.useQuery(
    { email },
    { enabled: false },
  ); // 이메일로 아이디 조회 쿼리 (초기 비활성화)

  // 아이디 찾기 버튼 클릭 시 호출되는 함수
  const handleFindUsername = async (): Promise<void> => {
    setSubmissionError(""); // 에러 초기화
    if (!email) {
      setSubmissionError("이메일을 입력해주세요."); // 이메일 미입력 시
      return;
    }
    if (!isEmailVerified) {
      setSubmissionError("이메일 인증이 필요합니다."); // 이메일 미인증 시
      return;
    }
    const result = await findUsernameQuery.refetch(); // 아이디 조회 요청
    if (result.data) {
      openModal({
        title: "아이디 찾기 성공",
        content: React.createElement(
          "div",
          null,
          `등록된 아이디: ${result.data.username}`, // 조회된 아이디 표시
        ),
      });
    } else {
      setSubmissionError("해당 이메일로 등록된 계정을 찾을 수 없습니다."); // 조회 실패 시
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
    sendError,
    verifyError,
    submissionError,
    handleFindUsername,
  };
};
