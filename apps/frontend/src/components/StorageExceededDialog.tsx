import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#shadcn/components/AlertDialog.js";
import { formatStorage } from "#utils/formatStorage.js";

interface StorageExceededDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredSize: number;
  availableSize: number;
}

export function StorageExceededDialog({
  open,
  onOpenChange,
  requiredSize,
  availableSize,
}: StorageExceededDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>저장소 용량 부족</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              업로드하려는 파일의 크기가 남은 저장소 용량을 초과합니다.
            </p>
            <div className="text-sm bg-muted p-3 rounded">
              <div className="flex justify-between">
                <span>필요한 용량:</span>
                <span className="font-semibold">{formatStorage(requiredSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>사용 가능한 용량:</span>
                <span className="font-semibold">{formatStorage(availableSize)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>부족한 용량:</span>
                <span className="font-semibold">
                  {formatStorage(requiredSize - availableSize)}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              파일을 업로드하려면 먼저 저장소 공간을 확보하거나 요금제를 업그레이드하세요.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}