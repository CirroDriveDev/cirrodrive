import { Button } from "@/shadcn/components/Button.tsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/shadcn/components/card.tsx";
import type { PlanCardData } from "@/types/plan-card.ts";

interface PlanCardProps {
  plan: PlanCardData;
  onChangePlan?: (planId: string) => void;
  isCurrentPlan?: boolean;
}

export function PlanCard({ plan, onChangePlan, isCurrentPlan }: PlanCardProps) {
  const description = plan.description && (
    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
  );

  let intervalText = null;
  if (plan.price > 0) {
    intervalText =
      plan.intervalCount > 1 ?
        `/ ${plan.intervalCount} ${plan.interval}`
      : `/ ${plan.interval}`;
  }

  const trialPeriod =
    plan.trialPeriodDays ?
      <div className="mb-2 text-xs text-blue-600">
        {plan.trialPeriodDays}일 무료 체험
      </div>
    : null;

  const features =
    plan.features && Object.entries(plan.features).length > 0 ?
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {Object.entries(plan.features).map(([key, value]) => (
          <li key={key} className="text-muted-foreground">
            {typeof value === "string" ? value : key}
          </li>
        ))}
      </ul>
    : null;

  return (
    <Card
      className={`flex min-h-96 w-full max-w-xs flex-col justify-between border shadow-md ${!isCurrentPlan ? "border-primary ring-2 ring-primary" : "border-muted"}`}
    >
      <div className="flex w-full flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
            {!isCurrentPlan ?
              <span className="ml-2 rounded bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                변경 가능
              </span>
            : null}
          </div>
          {description}
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">
              {plan.price.toLocaleString()}
            </span>
            <span className="text-base font-medium text-muted-foreground">
              {plan.currency} {intervalText}
            </span>
          </div>
          {trialPeriod}
          {features}
        </CardContent>
      </div>
      <CardFooter>
        <Button
          className="w-full"
          type="button"
          onClick={() => onChangePlan?.(plan.id)}
          disabled={!plan.isActive || isCurrentPlan}
          variant={!isCurrentPlan ? "default" : "outline"}
        >
          {!isCurrentPlan ? "선택" : "현재 이용중"}
        </Button>
      </CardFooter>
    </Card>
  );
}
