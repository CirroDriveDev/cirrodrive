import { useLocation } from "react-router";
import { useEffect } from "react";
import { useConfirmBillingAuthorization } from "@/services/billing/useConfirmBillingAuthorization.ts";

export function usePaymentSuccess() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const authKey = query.get("authKey") ?? "";
  const customerKey = query.get("customerKey") ?? "";
  const planId = query.get("planId") ?? "";

  // useConfirmBillingAuthorization 훅을 사용하여, 결제 인증 API를 호출할 함수와 현재 상태(isPending, isSuccess, error)를 반환받습니다.
  const { confirm, isPending, isSuccess, error } =
    useConfirmBillingAuthorization();

  useEffect(() => {
    //  값이 모두 유효할 경우에만 결제 인증 요청을 실행합니다.
    if (authKey && customerKey && planId) {
      confirm({ authKey, customerKey, planId });
    }
    // 의존성 배열을 통해 값이 변경될 때마다 effect를 실행합니다.
  }, [authKey, customerKey, planId, confirm]);

  return { isPending, isSuccess, error }; // 결제 인증의 진행 상태와 결과를 반환합니다.
}
