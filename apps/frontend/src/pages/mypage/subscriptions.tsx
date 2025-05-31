import { PlanCard } from "#components/PlanCard.js";
import { useBillingAuth } from "#services/billing/useBillingAuth.js";
import { useCurrentPlan } from "#services/billing/useCurrentPlan.js";
import { usePlanList } from "#services/billing/usePlanList.js";
import type { PlanCardData } from "#types/plan-card.js";

export function Subscriptions(): JSX.Element {
  const { plans, isPending, error } = usePlanList();
  const { plan: currentPlan } = useCurrentPlan();
  const { requestBillingAuth } = useBillingAuth(
    "billing/success",
    "billing/fail",
  );

  const handleSubscribe = (planId: string) => {
    void requestBillingAuth(planId);
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        요금제 정보를 불러오는 중...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        요금제 정보를 불러오지 못했습니다.
      </div>
    );
  }
  if (!plans || plans.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        이용 가능한 요금제가 없습니다.
      </div>
    );
  }

  const order = ["Free", "Standard", "Pro"];

  return (
    <div className="flex min-h-screen flex-row items-center justify-center gap-8">
      {(plans as PlanCardData[])
        .slice()
        .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
        .map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onChangePlan={handleSubscribe}
            isCurrentPlan={currentPlan?.id === plan.id}
          />
        ))}
    </div>
  );
}
