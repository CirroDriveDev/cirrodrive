import { trpc } from "#services/trpc";

/**
 * 사용자의 결제 내역을 조회하는 커스텀 훅
 *
 * @param {number} limit - 한 번에 가져올 결제 항목 수 (기본값: 20)
 * @returns {{
 *   payments: Payment[];
 *   nextCursor: string | null | undefined;
 *   isLoading: boolean;
 *   isError: boolean;
 *   refetch: () => void;
 * }}
 */
export function usePaymentHistory(limit = 20) {
  const query = trpc.payment.getPaymentHistory.useQuery({ limit });

  return {
    payments: query.data?.payments ?? [],
    nextCursor: query.data?.nextCursor,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
