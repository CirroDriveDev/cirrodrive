import { Link } from "react-router";
import {
  CreditCardIcon,
  CalendarIcon,
  WalletIcon,
  PackageIcon,
  ArrowUpIcon,
  InboxIcon,
} from "lucide-react";
import { trpc } from "#services/trpc.js";
import { Button } from "#shadcn/components/Button.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#shadcn/components/Card.js";
import { Badge } from "#shadcn/components/Badge.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { Progress } from "#shadcn/components/Progress.js";

export function SubscriptionPage(): JSX.Element {
  const currentPlan = trpc.billing.getCurrentPlan.useQuery();
  const subscription = trpc.subscription.getCurrent.useQuery();
  const storageUsage = trpc.storage.getUsage.useQuery();

  // 미구독 사용자 판별 로직 - subscription.data가 null이면 미구독 상태
  const isUnsubscribed = subscription.data === null;

  if (
    currentPlan.isPending ||
    subscription.isPending ||
    storageUsage.isPending
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // subscription.error는 실제 에러인 경우에만 처리 (null 반환은 정상적인 상황)
  if (currentPlan.error || subscription.error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            구독 정보를 불러올 수 없습니다
          </h2>
          <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  const getUsagePercentage = () => {
    if (!storageUsage.data) return 0;
    return Math.round((storageUsage.data.used / storageUsage.data.quota) * 100);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">내 요금제</h1>
        <Link to="/mypage/plans">
          <Button variant="outline">
            <CreditCardIcon className="w-4 h-4 mr-2" />
            {isUnsubscribed ? "요금제 보기" : "요금제 변경"}
          </Button>
        </Link>
      </div>

      {/* 미구독 사용자를 위한 UI */}
      {isUnsubscribed ?
        <>
          {/* 요금제 없음 상태 알림 */}
          <Card className="border-dashed border-2 border-gray-300">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <InboxIcon className="w-16 h-16 text-gray-400" />
              </div>
              <CardTitle className="text-xl text-gray-700">
                현재 사용 중인 요금제가 없습니다
              </CardTitle>
              <p className="text-gray-600 mt-2">
                CirroDrive의 다양한 요금제를 확인하고 더 많은 저장 공간과 기능을
                이용해보세요.
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/mypage/plans">
                  <Button size="lg" className="w-full sm:w-auto">
                    <ArrowUpIcon className="w-4 h-4 mr-2" />
                    요금제 보기
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <PackageIcon className="w-4 h-4 mr-2" />
                  무료 플랜 계속 사용
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                현재는 무료 플랜을 사용 중입니다. 구독을 시작하면 더 많은 기능을
                사용할 수 있습니다.
              </div>
            </CardContent>
          </Card>

          {/* 도움말 섹션 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">
                💡 왜 요금제가 필요한가요?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-blue-700">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>
                    <strong>더 많은 저장공간:</strong> 무료 플랜의 5GB를 넘어
                    50GB~1TB까지 사용 가능
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>
                    <strong>고급 공유 기능:</strong> 암호 보호, 만료 설정,
                    다운로드 제한 등
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>
                    <strong>우선 지원:</strong> 더 빠른 고객지원과 기술 지원
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p>
                    <strong>안전한 백업:</strong> 중요한 파일들을 안전하게 보관
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      : null}

      {/* 구독 사용자를 위한 기존 UI */}
      {!isUnsubscribed && (
        <>
          {/* 현재 요금제 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <WalletIcon className="w-5 h-5 mr-2" />
                현재 요금제
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {currentPlan.data?.name || "무료 요금제"}
                    </h3>
                    <p className="text-gray-600">
                      {currentPlan.data?.description ??
                        "기본 무료 요금제입니다."}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {currentPlan.data?.price ?
                        formatPrice(currentPlan.data.price)
                      : "무료"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(() => {
                        if (currentPlan.data?.interval === "MONTHLY")
                          return "월";
                        if (currentPlan.data?.interval === "YEARLY")
                          return "년";
                        return "";
                      })()}
                    </p>
                  </div>
                </div>

                {subscription.data ?
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      시작일:{" "}
                      {new Date(subscription.data.startedAt).toLocaleDateString(
                        "ko-KR",
                      )}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      만료일:{" "}
                      {new Date(subscription.data.expiresAt).toLocaleDateString(
                        "ko-KR",
                      )}
                    </div>
                    <Badge
                      variant={
                        subscription.data.status === "ACTIVE" ?
                          "default"
                        : "secondary"
                      }
                    >
                      {(() => {
                        switch (subscription.data.status) {
                          case "ACTIVE":
                            return "활성";
                          case "CANCELED":
                            return "취소됨";
                          case "EXPIRED":
                            return "만료됨";
                          case "TRIAL":
                            return "체험중";
                          case "UNPAID":
                            return "미납";
                          default:
                            return "알 수 없음";
                        }
                      })()}
                    </Badge>
                  </div>
                : null}
              </div>
            </CardContent>
          </Card>

          {/* 저장소 사용량 */}
          {storageUsage.data ?
            <Card>
              <CardHeader>
                <CardTitle>저장소 사용량</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {formatBytes(storageUsage.data.used)} /{" "}
                      {formatBytes(storageUsage.data.quota)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {getUsagePercentage()}% 사용 중
                    </span>
                  </div>

                  {/* Progress 컴포넌트로 대체 */}
                  <Progress
                    value={Math.min(getUsagePercentage(), 100)}
                    className={`${storageUsage.data.isNearLimit ? "bg-red-100" : undefined}`}
                    status={
                      storageUsage.data.isNearLimit ? "error" : "inProgress"
                    }
                  />

                  {storageUsage.data.isNearLimit ?
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        ⚠️ 저장소 용량이 부족합니다. 더 많은 저장 공간이
                        필요하시면 요금제를 업그레이드하세요.
                      </p>
                    </div>
                  : null}
                </div>
              </CardContent>
            </Card>
          : null}

          {/* 빠른 액션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/mypage/payments">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CreditCardIcon className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <h3 className="font-semibold">결제 내역</h3>
                      <p className="text-sm text-gray-600">
                        과거 결제 내역을 확인하세요
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/mypage/plans">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <WalletIcon className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <h3 className="font-semibold">요금제 변경</h3>
                      <p className="text-sm text-gray-600">
                        다른 요금제를 살펴보세요
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
