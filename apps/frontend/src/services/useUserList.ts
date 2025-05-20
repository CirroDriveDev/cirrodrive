import { getQueryKey, type TRPCClientErrorLike } from "@trpc/react-query";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { AppRouter, RouterOutput } from "@cirrodrive/backend/app-router";
import { trpc } from "#services/trpc.js";

interface UseUserList {
  query: UseTRPCQueryResult<
    RouterOutput["protected"]["user"]["list"],
    TRPCClientErrorLike<AppRouter>
  >;
}

/**
 * 관리자 전용 전체 사용자 목록을 조회하는 커스텀 훅입니다. 서버의 `protected.user.list` 절차를 호출합니다.
 */
export const useUserList = (): UseUserList => {
  const query = trpc.protected.user.list.useQuery({});
  return { query };
};

/**
 * React Query에서 사용 가능한 쿼리 키 (캐싱/리패칭 등에 사용)
 */
export const userListQueryKey = getQueryKey(trpc.protected.user.list);
