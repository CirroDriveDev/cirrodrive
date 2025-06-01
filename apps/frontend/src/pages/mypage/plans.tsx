import { useNavigate } from "react-router";
import { PlanCard } from "#components/PlanCard.js";
import { trpc } from "#services/trpc.js";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "#shadcn/components/Tabs.js";

export function PlansPage(): JSX.Element {
  const planList = trpc.plan.list.useQuery();
  const currentPlan = trpc.billing.getCurrentPlan.useQuery();
  const navigate = useNavigate();

  const handleSubscribe = (planId: string) => {
    void navigate(`/billing/confirm/${planId}`); // 결제 확인 페이지로 이동
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

  // 월/년 요금제 분리
  const monthlyPlans = planList.data.filter(
    (plan) => plan.interval === "MONTHLY",
  );
  const yearlyPlans = planList.data.filter(
    (plan) => plan.interval === "YEARLY" || plan.price === 0, // 무료 요금제 포함
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Tabs defaultValue="monthly" className="w-full max-w-4xl">
        <TabsList className="mb-6 flex justify-center">
          <TabsTrigger value="monthly">월 결제</TabsTrigger>
          <TabsTrigger value="yearly">년 결제</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly">
          <div className="flex flex-row items-center justify-center gap-8">
            {monthlyPlans.length === 0 ?
              <div>월 결제 요금제가 없습니다.</div>
            : monthlyPlans
                .slice()
                .sort((a, b) => a.price - b.price)
                .map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onChangePlan={handleSubscribe}
                    isCurrentPlan={currentPlan.data?.id === plan.id}
                  />
                ))
            }
          </div>
        </TabsContent>
        <TabsContent value="yearly">
          <div className="flex flex-row items-center justify-center gap-8">
            {yearlyPlans.length === 0 ?
              <div>년 결제 요금제가 없습니다.</div>
            : yearlyPlans
                .slice()
                .sort((a, b) => a.price - b.price)
                .map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onChangePlan={handleSubscribe}
                    isCurrentPlan={currentPlan.data?.id === plan.id}
                  />
                ))
            }
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
