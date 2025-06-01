import { trpc } from "#services/trpc.js";

interface ConfirmBillingInput {
  authKey: string;
  customerKey: string;
  planId: string;
  options?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  };
}

/**
 * 결제 인증을 처리하는 커스텀 훅
 *
 * @returns Confirm 함수와 mutation 상태값을 반환합니다.
 */
export function useConfirmBillingAuthorization() {
  const mutation = trpc.billing.registerBilling.useMutation();

  return {
    /**
     * 결제 인증을 비동기로 처리하는 함수
     *
     * @param authKey - 인증 키
     * @param customerKey - 고객 키
     * @param planId - 요금제 ID
     */
    confirm: async ({ authKey, customerKey, planId }: ConfirmBillingInput) => {
      return await mutation.mutateAsync({ authKey, customerKey, planId });
    },
    /**
     * 인증 요청 로딩 상태
     */
    isPending: mutation.isPending,
    /**
     * 인증 성공 여부
     */
    isSuccess: mutation.isSuccess,
    /**
     * 인증 에러 정보
     */
    error: mutation.error,
  };
}
