import { useNavigate } from "react-router";
import { CreditCardIcon } from "lucide-react";
import { PlanCard } from "#components/PlanCard.js";
import { trpc } from "#services/trpc.js";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "#shadcn/components/Tabs.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "#shadcn/components/Card.js";

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
        <div className="text-lg">요금제 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (planList.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle className="text-xl text-red-600">
              요금제 정보를 불러오지 못했습니다
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600">잠시 후 다시 시도해주세요.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!planList.data || planList.data.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle className="text-xl">
              이용 가능한 요금제가 없습니다
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600">관리자에게 문의해주세요.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 월/년 요금제 분리
  const monthlyPlans = planList.data.filter(
    (plan) => plan.interval === "MONTHLY",
  );
  const yearlyPlans = planList.data.filter(
    (plan) => plan.interval === "YEARLY" || plan.price === 0,
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">요금제 변경</h1>
          <p className="text-gray-600 mt-1">
            원하는 요금제를 선택해 구독을 변경할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center">
          <CreditCardIcon className="w-6 h-6 text-blue-500" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>요금제 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="mb-6 flex justify-center">
              <TabsTrigger value="monthly">월 결제</TabsTrigger>
              <TabsTrigger value="yearly">년 결제</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly">
              <div className="flex flex-row flex-nowrap items-center justify-center gap-8">
                {monthlyPlans.length === 0 ?
                  <div className="text-gray-500">
                    월 결제 요금제가 없습니다.
                  </div>
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
              <div className="flex flex-row flex-nowrap items-center justify-center gap-8">
                {yearlyPlans.length === 0 ?
                  <div className="text-gray-500">
                    년 결제 요금제가 없습니다.
                  </div>
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
        </CardContent>
      </Card>

      {/* 안내문구 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">요금제 안내</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>요금제 변경 시 남은 기간은 자동으로 환산되어 적용됩니다.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>결제 및 환불 정책은 고객센터를 참고해주세요.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
