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

  /**
   * 결제 상태에 따라 텍스트와 스타일 클래스 반환
   * 
   * @param status "paid" | "failed" | "pending"
   * @returns { text: string, className: string }
   */
  const getStatusInfo = (status: "paid" | "failed" | "pending") => {
    if (status === "paid") {
      return { text: "성공", className: "text-green-600 font-medium" };
    }
    if (status === "failed") {
      return { text: "실패", className: "text-red-600 font-medium" };
    }
    return { text: "대기", className: "text-gray-600" };
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
              <TableHead>결제 수단</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">설명</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => {
              const { text, className } = getStatusInfo(p.status);

              return (
                <TableRow key={p.id}>
                  <TableCell>{new Date(p.paidAt).toLocaleDateString()}</TableCell>
                  <TableCell>₩{p.amount.toLocaleString()}</TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell>
                    <span className={className}>{text}</span>
                  </TableCell>
                  <TableCell className="text-right">{p.description ?? "-"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
