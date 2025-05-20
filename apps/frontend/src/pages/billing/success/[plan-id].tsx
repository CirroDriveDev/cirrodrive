import { useNavigate, useParams, useSearchParams } from "react-router";
import { useEffect } from "react";
import { useConfirmBillingAuthorization } from "#services/billing/useConfirmBillingAuthorization.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";

export function Success(): JSX.Element | null {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();
  const { confirm } = useConfirmBillingAuthorization();
  const authKey = searchParams.get("authKey")!;
  const customerKey = searchParams.get("customerKey")!;

  useEffect(() => {
    confirm({
      authKey,
      customerKey,
      planId: planId!,
    })
      .then(() => {
        void navigate("/subscribe");
      })
      .catch(() => {
        void navigate("/billing/fail");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- test
  }, [planId, authKey, customerKey]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  ); // 로딩 스피너를 보여줍니다.
}
