import { AlertTriangle } from "lucide-react";
import { useSubscription } from "#services/subscription/useSubscription.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#shadcn/components/Card.js";
import { Skeleton } from "#shadcn/components/Skeleton.js";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "#shadcn/components/Alert.js";

/**
 * 마이페이지에서 현재 사용 중인 요금제를 보여주는 섹션 컴포넌트
 *
 * @component
 */
export function MyPlanSection(): JSX.Element {
  const { subscription, isPending, error } = useSubscription();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>내 요금제</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-2/3" aria-label="요금제 이름 로딩 중" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-4 w-1/4" />
        </CardContent>
      </Card>
    );
  }

  if (error || !subscription) {
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
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div>
          <span className="font-medium text-primary">요금제 이름:</span> {subscription.name}
        </div>
        <div>
          <span className="font-medium text-primary">상태:</span> {subscription.status}
        </div>
        <div>
          <span className="font-medium text-primary">다음 결제일:</span> {subscription.billingDate}
        </div>
        <div>
          <span className="font-medium text-primary">만료일:</span> {subscription.expirationDate}
        </div>
        <div>
          <span className="font-medium text-primary">가격:</span> {subscription.price.toLocaleString()}원
        </div>
      </CardContent>
    </Card>
  );
}
