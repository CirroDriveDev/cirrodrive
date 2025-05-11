import React, { useState } from "react";
import { userSchema } from "@cirrodrive/schemas";
import { useEmailCode } from "@/pages/register/api/useEmailCode.ts";
import { trpc } from "@/services/trpc.ts";
import { useModalStore } from "@/store/useModalStore.ts";
import { useBoundStore } from "@/store/useBoundStore.ts";

export interface UseFindPasswordReturn {
  email: string;
  verificationCode: string;
  timer: number;
  cooldown: number;
  isEmailVerified: boolean;
  sendError?: string;
  verifyError?: string;
  submissionError?: string;
  username: string;
  newPassword: string;
  newPasswordConfirm: string;
  handleCodeInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendCode: () => Promise<void>;
  handleVerifyCode: () => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFindPassword: (e: React.FormEvent) => Promise<void>;
}

// 비밀번호 찾기 페이지 전용 커스텀 훅
export const useFindPassword = (): UseFindPasswordReturn => {
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
  } = useEmailCode(); // 이메일 인증 관련 상태와 함수

  const [username, setUsername] = useState(""); // 입력한 아이디
  const [newPassword, setNewPassword] = useState(""); // 새 비밀번호
  const [newPasswordConfirm, setNewPasswordConfirm] = useState(""); // 새 비밀번호 확인
  const [submissionError, setSubmissionError] = useState(""); // 제출 시 에러 메시지
  const { openModal } = useModalStore(); // 모달 오픈 함수
  const { token } = useBoundStore(); // 저장된 인증 토큰

  const resetPasswordMutation = trpc.user.resetPassword.useMutation(); // 비밀번호 재설정 뮤테이션
  const findUsernameQuery = trpc.user.findUsername.useQuery(
    { email },
    { enabled: false },
  ); // 이메일로 아이디 찾기 쿼리 (초기에는 비활성화)

  // 입력 필드 값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (name === "username")
      setUsername(value); // 아이디 입력
    else if (name === "newPassword")
      setNewPassword(value); // 새 비밀번호 입력
    else if (name === "newPasswordConfirm") setNewPasswordConfirm(value); // 새 비밀번호 확인 입력
  };

  // 비밀번호 찾기 제출 핸들러
  const handleFindPassword = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmissionError(""); // 제출 에러 초기화

    if (!isEmailVerified) {
      setSubmissionError("이메일 인증이 필요합니다."); // 이메일 인증 안 됐을 때
      return;
    }
    if (!username || !newPassword || !newPasswordConfirm) {
      setSubmissionError("모든 입력 칸을 입력해주세요."); // 입력값 누락 시
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setSubmissionError("비밀번호가 일치하지 않습니다."); // 비밀번호 불일치
      return;
    }

    const passwordValidation = userSchema.shape.password.safeParse(newPassword); // 비밀번호 유효성 검사
    if (!passwordValidation.success) {
      setSubmissionError(
        passwordValidation.error.errors[0]?.message ??
          "비밀번호 검증에 실패했습니다.",
      );
      return;
    }

    const result = await findUsernameQuery.refetch(); // 이메일로 아이디 조회
    if (!result.data) {
      setSubmissionError("해당 이메일로 등록된 계정을 찾을 수 없습니다."); // 계정 없음
      return;
    }
    if (result.data.username !== username) {
      setSubmissionError("입력하신 아이디와 이메일이 일치하지 않습니다."); // 아이디 불일치
      return;
    }

    if (!token) {
      setSubmissionError("토큰이 없습니다."); // 인증 토큰 없음
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        email,
        token,
        newPassword,
      }); // 비밀번호 재설정 요청
      openModal({
        title: "비밀번호 찾기 성공",
        content: React.createElement(
          "div",
          null,
          "새로운 비밀번호로 설정되었습니다.",
        ), // 성공 모달
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSubmissionError(error.message); // 서버 에러 처리
      } else {
        setSubmissionError("알 수 없는 오류가 발생했습니다."); // 예외 처리
      }
    }
  };

  return {
    email,
    verificationCode,
    timer,
    cooldown,
    isEmailVerified,
    sendError,
    verifyError,
    submissionError,
    username,
    newPassword,
    newPasswordConfirm,
    handleCodeInputChange,
    handleSendCode,
    handleVerifyCode,
    handleInputChange,
    handleFindPassword,
  };
};
