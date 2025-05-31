import type {
  AppRouter,
  RouterInput,
  RouterOutput,
} from "@cirrodrive/backend/app-router";
import { useState } from "react";
import { type UseTRPCMutationOptions } from "@trpc/react-query/shared";
import { type TRPCClientErrorLike } from "@trpc/client";
import { trpc } from "#services/trpc.js";
import { useBoundStore } from "#store/useBoundStore.js";

type UseLoginOptions = UseTRPCMutationOptions<
  RouterInput["session"]["login"],
  TRPCClientErrorLike<AppRouter>,
  RouterOutput["session"]["login"]
>;

/**
 * 일반 사용자 로그인 커스텀 훅
 *
 * - TRPC mutation을 통해 로그인을 처리합니다.
 * - 로그인 성공 시 사용자 정보를 zustand store에 저장합니다.
 * - 로그인 실패 시 submissionError에 에러 메시지를 저장합니다.
 *
 * @param opts TRPC mutation 옵션 (onSuccess, onError 등)
 * @returns Login 함수와 submissionError 상태
 */
export const useLogin = (opts?: UseLoginOptions) => {
  const { setUser } = useBoundStore();
  const [submissionError, setSubmissionError] = useState<string>();

  const mutation = trpc.session.login.useMutation({
    ...opts,
    onSuccess: (data, variables, context) => {
      setUser(data);
      opts?.onSuccess?.(data, variables, context);
      setSubmissionError(undefined);
    },
    onError: (error, variables, context) => {
      opts?.onError?.(error, variables, context);
      setSubmissionError(error.message ?? "로그인에 실패했습니다.");
    },
  });

  return {
    login: mutation.mutateAsync,
    submissionError,
  };
};
