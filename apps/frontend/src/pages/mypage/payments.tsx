import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#shadcn/components/Table.js";

export function PaymentsPage(): JSX.Element {
  const [page, setPage] = useState(0);
  const limit = 10;

  const payments = trpc.payment.getPayment.useQuery({
    limit,
    cursor: undefined, // Note: cursor pagination doesn't work with page offset
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DONE":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            완료
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive">
            <XCircleIcon className="w-3 h-3 mr-1" />
            실패
          </Badge>
        );
      case "READY":
      case "IN_PROGRESS":
        return (
          <Badge variant="secondary">
            <ClockIcon className="w-3 h-3 mr-1" />
            진행중
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge variant="outline">
            <XCircleIcon className="w-3 h-3 mr-1" />
            취소됨
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (payments.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (payments.error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            결제 내역을 불러올 수 없습니다
          </h2>
          <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  const hasNextPage = payments.data?.nextCursor !== null;
  const hasPreviousPage = page > 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">결제 내역</h1>
          <p className="text-gray-600 mt-1">
            과거 결제 내역을 확인할 수 있습니다
          </p>
        </div>
        <div className="flex items-center">
          <CreditCardIcon className="w-6 h-6 text-blue-500" />
        </div>
      </div>

      {!payments.data?.payments || payments.data.payments.length === 0 ?
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCardIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              결제 내역이 없습니다
            </h3>
            <p className="text-gray-600">
              아직 결제한 내역이 없습니다. 요금제를 구독하면 결제 내역이 여기에
              표시됩니다.
            </p>
          </CardContent>
        </Card>
      : <>
          <Card>
            <CardHeader>
              <CardTitle>결제 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>결제일</TableHead>
                      <TableHead>상품명</TableHead>
                      <TableHead>결제수단</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.data.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(payment.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">결제</div>
                            <div className="text-sm text-gray-500">
                              구독 ID: {payment.subscriptionId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>카드 결제</TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {formatPrice(payment.amount)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {payments.data.payments.length}개의 결제 내역
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={!hasPreviousPage}
              >
                <ChevronLeftIcon className="w-4 h-4" />
                이전
              </Button>
              <span className="text-sm font-medium px-3">
                페이지 {page + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNextPage}
              >
                다음
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      }

      {/* 도움말 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">결제 관련 안내</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>결제 내역은 최대 3년간 보관됩니다.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>
                세금계산서나 현금영수증이 필요하시면 고객지원으로 문의해주세요.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>결제 취소나 환불은 결제 후 7일 이내에만 가능합니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
