import { useState } from "react";
import type {
  AppRouter,
  RouterInput,
  RouterOutput,
} from "@cirrodrive/backend/app-router";
import type { UseTRPCMutationOptions } from "@trpc/react-query/shared";
import type { TRPCClientErrorLike } from "@trpc/client";
import { trpc } from "#services/trpc.js";
import { useBoundStore } from "#store/useBoundStore.js";

type UseLogoutOptions = UseTRPCMutationOptions<
  RouterInput["session"]["logout"],
  TRPCClientErrorLike<AppRouter>,
  RouterOutput["session"]["logout"]
>;

interface UseLogout {
  submissionError: string | undefined;

  mutation: ReturnType<typeof trpc.session.logout.useMutation>;

  /**
   * 로그아웃 함수
   */
  logout: () => void;
}

export const useLogout = (opts?: UseLogoutOptions): UseLogout => {
  const { clearUser } = useBoundStore();

  const [submissionError, setSubmissionError] = useState<string>();

  const mutation = trpc.session.logout.useMutation({
    ...opts,
    onSuccess: (data, variable, context) => {
      clearUser();
      opts?.onSuccess?.(data, variable, context);
    },
    onError: (error, variable, context) => {
      setSubmissionError(error.message);
      opts?.onError?.(error, variable, context);
    },
  });

  const logout = (): void => {
    // 로그아웃 요청이 성공하든 실패하든 사용자 정보를 초기화
    clearUser();

    mutation.mutate();
  };

  return {
    logout,
    mutation,
    submissionError,
  };
};
