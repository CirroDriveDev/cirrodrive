import { type PaymentStatus } from "@cirrodrive/schemas/billing";
import { usePaymentHistory } from "#services/billing/usePaymentHistory.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "#shadcn/components/Card.js";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "#shadcn/components/Table.js";

/**
 * 결제 내역을 표 형식으로 보여주는 UI 컴포넌트
 *
 * @returns {JSX.Element} 결제 내역 섹션 카드
 */
export function PaymentHistorySection(): JSX.Element {
  const { payments, isLoading, isError } = usePaymentHistory();

  if (isLoading) return <p>결제 내역을 불러오는 중입니다...</p>;
  if (isError) return <p>결제 내역을 불러오는 데 실패했습니다.</p>;

  // paymentDTO의 status 값을 한글로 변환
  const getStatusInfo = (status: PaymentStatus) => {
    switch (status) {
      case "DONE":
        return { text: "성공", className: "text-green-600 font-medium" };
      case "CANCELED":
        return { text: "취소됨", className: "text-gray-500" };
      case "FAILED":
        return { text: "실패", className: "text-red-600 font-medium" };
      case "IN_PROGRESS":
        return { text: "진행중", className: "text-blue-600" };
      case "READY":
      default:
        return { text: "대기", className: "text-gray-600" };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>결제 내역</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>결제일</TableHead>
              <TableHead>금액</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>영수증</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => {
              const { text, className } = getStatusInfo(p.status);
              const paidDate =
                p.approvedAt ? new Date(p.approvedAt) : new Date(p.createdAt);
              return (
                <TableRow key={p.id}>
                  <TableCell>{paidDate.toLocaleDateString()}</TableCell>
                  <TableCell>₩{p.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={className}>{text}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {p.receiptUrl ?
                      <a
                        href={p.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        영수증 보기
                      </a>
                    : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
