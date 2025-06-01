import { AlertTriangle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "#shadcn/components/Alert.js";
import { trpc } from "#services/trpc.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#shadcn/components/Card.js";

/**
 * 마이페이지에서 현재 사용 중인 요금제를 보여주는 섹션 컴포넌트
 *
 * @component
 */
export function MyPlanSection(): JSX.Element {
  const currentSubscription = trpc.subscription.getCurrent.useQuery();

  // 날짜를 'YYYY년 MM월 DD일'로 포맷하는 함수
  function formatDate(date: string | Date | undefined | null) {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";
    return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, "0")}월 ${String(d.getDate()).padStart(2, "0")}일`;
  }

  if (currentSubscription.isPending) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (currentSubscription.error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>구독 정보를 불러오지 못했습니다.</AlertTitle>
        <AlertDescription>잠시 후 다시 시도해주세요.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>내 요금제</CardTitle>
        <CardDescription>
          현재 사용 중인 요금제 정보를 확인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">요금제</span>
            <span className="font-semibold text-lg">
              {currentSubscription.data?.plan?.name ?? "-"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">상태</span>
            <span className="font-semibold">
              {currentSubscription.data?.status ?? "-"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">
              구독 시작일
            </span>
            <span>{formatDate(currentSubscription.data?.startedAt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">
              다음 결제일
            </span>
            <span>{formatDate(currentSubscription.data?.nextBillingAt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">만료일</span>
            <span>{formatDate(currentSubscription.data?.expiresAt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">요금</span>
            <span className="font-semibold text-primary">
              {currentSubscription.data?.plan?.price ?
                `${currentSubscription.data.plan.price.toLocaleString()}원`
              : "-"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
