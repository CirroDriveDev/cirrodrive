import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { type BillingDTO, type PlanDTO } from "@cirrodrive/schemas/billing";
import { CreditCardIcon, PlusIcon } from "lucide-react";
import { getQueryKey } from "@trpc/react-query";
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
import { useRedirectStore } from "#store/useRedirectStore.js";
import { queryClient } from "#app/provider/queryClient.js";

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
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">요금제 결제 확인</h1>
      <PaymentConfirmCard plan={plan.data} />
    </div>
  );
}

export function PaymentConfirmCard({ plan }: { plan: PlanDTO }) {
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<BillingDTO | null>(
    null,
  );
  const { mutateAsync: subscribe } = trpc.billing.subscribeToPlan.useMutation();
  const { setRedirectPath, clearRedirectPath } = useRedirectStore();
  const { requestBillingAuth } = useBillingAuth(
    "billing/success",
    "billing/fail",
  );
  const navigate = useNavigate();

  const handleBillingAuth = async () => {
    if (!plan.id) {
      setError("유효하지 않은 요금제입니다.");
      return;
    }
    setRedirectPath(`/billing/confirm/${plan.id}`);
    try {
      await requestBillingAuth();
    } catch {
      clearRedirectPath();
    }
  };

  const handleConfirm = async () => {
    if (!agree) return;
    if (!selectedBilling) {
      setError("결제수단을 선택해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // 서버 API 호출 예: /api/subscribe
      await subscribe({
        planId: plan.id,
        billingId: selectedBilling?.id,
      });
      void navigate("/mypage");
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
        {/* 결제수단 표시 영역 */}
        <div className="mb-4">
          <BillingMethodDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            selectedBilling={selectedBilling}
            onSelectBilling={setSelectedBilling}
            onBillingAuth={handleBillingAuth}
          />
        </div>
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
  selectedBilling,
  onSelectBilling,
  onBillingAuth,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBilling: BillingDTO | null;
  onSelectBilling: (method: BillingDTO) => void;
  onBillingAuth: () => Promise<void>;
}) {
  const billingList = trpc.billing.getBillingMethods.useQuery();
  const billingMethods = useMemo(
    () => billingList.data ?? [],
    [billingList.data],
  );
  useEffect(() => {
    if (billingMethods.length > 0) {
      const sorted = [...billingMethods].sort(
        (a, b) => a.priority - b.priority,
      );
      onSelectBilling(sorted[0]);
    }
  }, [billingMethods, onSelectBilling]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex w-full justify-start space-x-2"
          type="button"
        >
          <CreditCardIcon />
          {selectedBilling ?
            <span>
              {selectedBilling.cardCompany} {selectedBilling.cardType} (
              {selectedBilling.cardNumber})
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
                <DialogClose asChild key={method.id}>
                  <BillingMethodItem
                    method={method}
                    selected={selectedBilling?.id === method.id}
                    onClick={() => onSelectBilling(method)}
                  />
                </DialogClose>
              ))}
            </>
          : null}
          <Button
            variant="secondary"
            className="flex w-full mt-2 space-x-2"
            onClick={onBillingAuth}
          >
            <PlusIcon />
            <span>새 결제수단 등록</span>
          </Button>
        </div>
        <DialogFooter>
          {/* <Button type="button" variant="outline" disabled>
            결제수단 관리(준비 중)
          </Button> */}
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

function BillingMethodItem({
  method,
  selected,
  onClick,
}: {
  method: BillingDTO;
  selected: boolean;
  onClick: () => void;
}) {
  const isUsed = trpc.billing.isBillingUsed.useQuery({ billingId: method.id });
  const { mutateAsync: deleteBilling } =
    trpc.billing.deleteBilling.useMutation();
  const queryKey = getQueryKey(trpc.billing.getBillingMethods);

  const handleDelete = async () => {
    await deleteBilling({ billingId: method.id });
    await queryClient.invalidateQueries({ queryKey });
  };

  return (
    <div className="flex items-center justify-between space-x-2 relative">
      <Button
        key={method.id}
        variant={selected ? "default" : "outline"}
        className="flex w-full justify-between space-x-2"
        onClick={onClick}
      >
        <CreditCardIcon />
        <span>
          {method.cardCompany} {method.cardType} ({method.cardNumber})
        </span>
        <span className="flex-grow" />
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={isUsed.data ? "ghost" : "secondary"}
            className="w-16 h-8 absolute right-2"
            disabled={isUsed.data}
          >
            {isUsed.data ? "사용 중" : "삭제"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>결제수단 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 결제수단을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete}>
              삭제
            </Button>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
