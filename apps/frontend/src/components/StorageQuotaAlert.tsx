import { AlertCircle, X, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "#shadcn/components/Alert.js";
import { Button } from "#shadcn/components/Button.js";
import { formatStorage } from "#utils/formatStorage.js";

interface StorageQuotaAlertProps {
  isVisible: boolean;
  errorMessage?: string;
  remainingBytes?: number;
  onDismiss: () => void;
  onUpgradePlan?: () => void;
}

/**
 * 저장소 할당량 초과 시 표시되는 알림 컴포넌트
 */
export function StorageQuotaAlert({
  isVisible,
  errorMessage,
  remainingBytes,
  onDismiss,
  onUpgradePlan,
}: StorageQuotaAlertProps): JSX.Element | null {
  if (!isVisible) return null;

  return (
    <Alert variant="destructive" className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="pr-8">
        <div className="space-y-2">
          <p className="font-medium">저장 공간이 부족합니다</p>
          {errorMessage ?
            <p className="text-sm">{errorMessage}</p>
          : null}
          {remainingBytes !== undefined && remainingBytes >= 0 && (
            <p className="text-sm">
              사용 가능한 용량: {formatStorage(remainingBytes)}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            {onUpgradePlan ?
              <Button
                size="sm"
                variant="outline"
                onClick={onUpgradePlan}
                className="text-xs"
              >
                <TrendingUp className="mr-1 h-3 w-3" />
                플랜 업그레이드
              </Button>
            : null}
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-xs"
            >
              확인
            </Button>
          </div>
        </div>
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDismiss}
        className="absolute right-2 top-2 h-6 w-6"
      >
        <X className="h-3 w-3" />
      </Button>
    </Alert>
  );
}
