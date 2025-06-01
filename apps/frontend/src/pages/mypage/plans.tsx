import { PlanCard } from "#components/PlanCard.js";
import { useBillingAuth } from "#services/billing/useBillingAuth.js";
import { trpc } from "#services/trpc.js";
import { type PlanCardData } from "#types/plan-card.js";

export function PlansPage(): JSX.Element {
  const planList = trpc.plan.list.useQuery();

  const currentPlan = trpc.billing.getCurrentPlan.useQuery();

  const { requestBillingAuth } = useBillingAuth(
    "billing/success",
    "billing/fail",
  );

  const handleSubscribe = (planId: string) => {
    void requestBillingAuth(planId);
  };

  if (planList.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        요금제 정보를 불러오는 중...
      </div>
    );
  }

  if (planList.error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        요금제 정보를 불러오지 못했습니다.
      </div>
    );
  }

  if (!planList.data || planList.data.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        이용 가능한 요금제가 없습니다.
      </div>
    );
  }

  const order = ["Free", "Standard", "Pro"];

  return (
    <div className="flex min-h-screen flex-row items-center justify-center gap-8">
      {planList.data
        .slice()
        .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
        .filter((plan) => plan.price > 0)
        .map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan as PlanCardData}
            onChangePlan={handleSubscribe}
            isCurrentPlan={currentPlan.data?.id === plan.id}
          />
        ))}
    </div>
  );
}
