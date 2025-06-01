import { type PlanDTO } from "@cirrodrive/schemas/billing";
import { Button } from "#shadcn/components/Button.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "#shadcn/components/Card.js";

interface PlanCardProps {
  plan: PlanDTO;
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
    plan.trialDays ?
      <div className="mb-2 text-xs text-blue-600">
        {plan.trialDays}일 무료 체험
      </div>
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
              KRW {intervalText}
            </span>
          </div>
          {trialPeriod}
          {plan.storageLimit > 0 && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">저장 용량:</span>{" "}
              {(plan.storageLimit / 1024).toLocaleString()} GB
            </div>
          )}
        </CardContent>
      </div>
      <CardFooter>
        <Button
          className="w-full"
          type="button"
          onClick={() => onChangePlan?.(plan.id)}
          disabled={isCurrentPlan}
          variant={!isCurrentPlan ? "default" : "outline"}
        >
          {!isCurrentPlan ? "선택" : "현재 이용중"}
        </Button>
      </CardFooter>
    </Card>
  );
}
