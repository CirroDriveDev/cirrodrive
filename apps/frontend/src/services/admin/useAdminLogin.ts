import type {
  AppRouter,
  RouterInput,
  RouterOutput,
} from "@cirrodrive/backend/app-router";
import { useState } from "react";
import { type UseTRPCMutationOptions } from "@trpc/react-query/shared";
import { type TRPCClientErrorLike } from "@trpc/client";
import { trpc } from "#services/trpc.js";
import { useAdminStore } from "#store/useAdminStore.js";

type UseAdminLoginOptions = UseTRPCMutationOptions<
  RouterInput["protected"]["session"]["login"], // 로그인 요청 입력 타입
  TRPCClientErrorLike<AppRouter>, // tRPC 오류 타입
  RouterOutput["protected"]["session"]["login"] // 로그인 요청 출력 타입
>;

/**
 * 관리자 로그인 커스텀 훅
 *
 * - TRPC mutation을 통해 관리자 로그인을 처리합니다.
 * - 로그인 성공 시 관리자 정보를 zustand store에 저장합니다.
 * - 로그인 실패 시 submissionError에 에러 메시지를 저장합니다.
 *
 * @param opts TRPC mutation 옵션 (onSuccess, onError 등)
 * @returns Mutation 객체와 submissionError 상태
 */
export const useAdminLogin = (opts?: UseAdminLoginOptions) => {
  // zustand 관리자 store에서 setAdmin 함수 사용
  const { setAdmin } = useAdminStore();
  // 서버 요청 에러 메시지 상태
  const [submissionError, setSubmissionError] = useState<string>();

  // tRPC mutation: 관리자 로그인
  const mutation = trpc.protected.session.login.useMutation({
    ...opts,
    // 로그인 성공 시 관리자 정보를 store에 저장
    onSuccess: (data, variables, context) => {
      setAdmin({
        id: data.id,
        email: data.email,
        name: data.name,
      });
      opts?.onSuccess?.(data, variables, context); // 추가적인 성공 콜백 호출
      setSubmissionError(undefined);
    },
    // 로그인 실패 시 에러 메시지 저장
    onError: (error, variables, context) => {
      opts?.onError?.(error, variables, context); // 추가적인 에러 콜백 호출
      setSubmissionError(error.message ?? "로그인에 실패했습니다.");
    },
  });

  return {
    login: mutation.mutateAsync, // 로그인 함수
    submissionError, // 서버 요청 에러 메시지
  };
};
