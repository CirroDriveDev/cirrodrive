import { useNavigate, useSearchParams } from "react-router";
import { useEffect, useRef } from "react";
import { useConfirmBillingAuthorization } from "#services/billing/useConfirmBillingAuthorization.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { useRedirectStore } from "#store/useRedirectStore.js";

export function Success(): JSX.Element | null {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authKey = searchParams.get("authKey")!;
  const customerKey = searchParams.get("customerKey")!;

  const { redirectPath } = useRedirectStore();

  const { confirm } = useConfirmBillingAuthorization();

  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    confirm({
      authKey,
      customerKey,
    })
      .then(() => {
        void navigate(redirectPath ?? "/mypage/plans");
      })
      .catch(() => {
        void navigate("/billing/fail");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- test
  }, [authKey, customerKey]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
