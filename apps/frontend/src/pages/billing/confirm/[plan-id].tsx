import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { type BillingDTO, type PlanDTO } from "@cirrodrive/schemas/billing";
import { trpc } from "#services/trpc.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "#shadcn/components/Card.js";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "#shadcn/components/Table.js";
import { Checkbox } from "#shadcn/components/Checkbox.js";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "#shadcn/components/Alert.js";
import { Button } from "#shadcn/components/Button.js";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "#shadcn/components/Dialog.js";
import { useBillingAuth } from "#services/billing/useBillingAuth.js";

/**
 * 요금제 결제 확인 페이지
 *
 * - 결제 진행 및 완료 안내, 결제 상태 확인 등 구현 예정
 */
export function BillingConfirmPage() {
  const { planId } = useParams();
  const plan = trpc.plan.get.useQuery(
    { id: planId ?? "" },
    { enabled: Boolean(planId) },
  );
  const { requestBillingAuth } = useBillingAuth(
    "billing/success",
    "billing/fail",
  );

  if (plan.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        로딩 중...
      </div>
    );
  }
  if (plan.isError || !plan.data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        요금제 정보를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">요금제 결제 확인</h1>
      <p>
        선택한 요금제: <span className="font-mono">{planId}</span>
      </p>
      <PaymentConfirmCard plan={plan.data} />
    </div>
  );
}

export function PaymentConfirmCard({ plan }: { plan: PlanDTO }) {
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { mutateAsync: subscribe } = trpc.billing.subscribeToPlan.useMutation();

  const handleConfirm = async () => {
    if (!agree) return;
    setLoading(true);
    setError("");
    try {
      // 서버 API 호출 예: /api/subscribe
      await subscribe({ planId: plan.id });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  let priceText = `₩${plan.price.toLocaleString()} / `;
  if (plan.intervalCount > 1) {
    priceText += `${plan.intervalCount}개월`;
  } else if (plan.interval === "YEARLY") {
    priceText += "년";
  } else {
    priceText += "월";
  }
  if (plan.price === 0) priceText += " (무료)";

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>{plan.name} 업그레이드</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 결제수단 표시 영역 */}
        <div className="mb-4">
          <BillingMethodDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </div>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">요금제</TableCell>
              <TableCell>{plan.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">금액</TableCell>
              <TableCell>{priceText}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">설명</TableCell>
              <TableCell>{plan.description ?? "-"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">결제 주기</TableCell>
              <TableCell>{plan.durationDays}일</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">저장 용량</TableCell>
              <TableCell>
                {plan.storageLimit ?
                  `${plan.storageLimit / 1024} GB`
                : "무제한"}
              </TableCell>
            </TableRow>
            {plan.trialDays > 0 && (
              <TableRow>
                <TableCell className="font-medium">체험 기간</TableCell>
                <TableCell>{plan.trialDays}일</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={agree}
            onCheckedChange={() => setAgree(!agree)}
          />
          <label htmlFor="terms" className="text-sm leading-snug">
            위 정보를 확인하였으며, 정기적으로 자동결제가 진행됨에 동의합니다.
          </label>
        </div>
        {error ?
          <Alert variant="destructive">
            <AlertTitle>결제 실패</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        : null}
      </CardContent>
      <CardFooter>
        <Button
          disabled={!agree || loading}
          onClick={handleConfirm}
          className="w-full"
        >
          {loading ? "결제 중..." : "결제하기"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function BillingMethodDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedBilling, setSelectedBilling] = useState<BillingDTO | null>(
    null,
  );
  const billingList = trpc.billing.getBillingMethods.useQuery();

  // 결제수단 우선순위 높은 것 선택
  const billingMethods = useMemo(
    () => billingList.data ?? [],
    [billingList.data],
  );
  useEffect(() => {
    if (billingMethods.length > 0) {
      // priority가 낮을수록 우선순위 높음
      const sorted = [...billingMethods].sort(
        (a, b) => a.priority - b.priority,
      );
      setSelectedBilling(sorted[0]);
    } else {
      setSelectedBilling(null);
    }
  }, [billingMethods]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
          type="button"
        >
          {selectedBilling ?
            <span>
              {selectedBilling.cardCompany} {selectedBilling.cardType} (우선순위{" "}
              {selectedBilling.priority})
            </span>
          : <span className="text-muted-foreground">결제수단 등록</span>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>결제수단 선택/등록</DialogTitle>
          <DialogDescription>
            등록된 결제수단을 선택하거나 새 결제수단을 등록할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {billingMethods.length > 0 ?
            <>
              {billingMethods.map((method) => (
                <Button
                  key={method.id}
                  variant={
                    selectedBilling?.id === method.id ? "default" : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => onSelectBilling(method)}
                >
                  {method.cardCompany} {method.cardType} (우선순위{" "}
                  {method.priority})
                </Button>
              ))}
            </>
          : <div className="text-sm text-muted-foreground">
              등록된 결제수단이 없습니다.
            </div>
          }
          {/* 결제수단 등록 폼은 실제 구현 필요. 아래는 자리 표시자 */}
          <Button variant="secondary" className="w-full mt-2" disabled>
            + 새 결제수단 등록 (구현 필요)
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              닫기
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
