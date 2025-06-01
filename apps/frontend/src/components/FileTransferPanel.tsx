import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  Download,
  ChevronUp,
  RotateCcwIcon,
  XIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { Progress } from "#shadcn/components/Progress.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#shadcn/components/Card.js";
import {
  Collapsible,
  CollapsibleContent,
} from "#shadcn/components/Collapsible.js";
import { useTransferStore } from "#store/useTransferStore.js";
import type { FileTransfer } from "#types/file-transfer";

function formatSize(size: number): string {
  if (size >= 1024 ** 3) return `${(size / 1024 ** 3).toFixed(1)} GB`;
  if (size >= 1024 ** 2) return `${(size / 1024 ** 2).toFixed(1)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
}

export function TransferPanel() {
  const { transfers, removeTransfer } = useTransferStore();
  const [isVisible, setIsVisible] = useState(true);
  const prevStatuses = useRef(new Map<string, string>());

  // ✅ 새 전송이 시작되면 자동으로 패널 열림
  useEffect(() => {
    if (transfers.length > 0) {
      setIsVisible(true);
    }
  }, [transfers]);

  useEffect(() => {
    transfers.forEach((item) => {
      const prev = prevStatuses.current.get(item.id);
      if (prev !== item.status) {
        if (item.status === "success") {
          toast.success(`✅ ${item.file.name} 업로드 완료`);
        } else if (item.status === "error") {
          toast.error(`❌ ${item.file.name} 업로드 실패`);
        } else if (item.status === "cancelled") {
          toast.warning(`⚠️ ${item.file.name} 업로드 취소됨`);
        }
        prevStatuses.current.set(item.id, item.status);
      }
    });
  }, [transfers]);

  const clearAllTransfers = () => {
    const count = transfers.length;
    transfers.forEach((item) => removeTransfer(item.id));
    if (count > 0) {
      toast.info(`🗑️ ${count}개의 항목이 모두 삭제되었습니다`);
    } else {
      toast.message("삭제할 항목이 없습니다");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 w-96 z-50 flex">
      <Collapsible asChild className="group/collapsible">
        <Card className="flex-grow">
          <CardHeader className="p-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">전송 중인 파일</CardTitle>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearAllTransfers}
                  className="text-foreground hover:text-red-500"
                  title="모든 항목 삭제"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="text-foreground hover:text-muted-foreground"
                  >
                    <ChevronUp className="w-6 h-6 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </button>
                </CollapsibleTrigger>
                <button
                  type="button"
                  onClick={() => setIsVisible(false)}
                  className="text-foreground hover:text-muted-foreground"
                  title="패널 닫기"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </CardHeader>

          <CollapsibleContent asChild>
            <CardContent>
              <ul className="min-h-12 max-h-60 overflow-y-auto custom-scrollbar pr-4">
                {transfers
                  .filter((item) => item.isRetry !== true)
                  .map((item) => (
                    <FileTransferItem key={item.id} item={item} />
                  ))}
              </ul>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

function FileTransferItem({ item }: { item: FileTransfer }) {
  const name = item.file.name;
  const size = formatSize(item.totalBytes ?? 0);
  const { removeTransfer, setStatus } = useTransferStore();

  const cancelItem = () => {
    item.cancel();
    setStatus(item.id, "cancelled");
    toast.warning(`⚠️ ${item.file.name} 업로드 취소됨`);
  };

  const retryItem = () => {
    item.retry();
    removeTransfer(item.id);
    toast.info(`🔁 ${item.file.name} 재시작됨`);
  };

  const typeIcon =
    item.type === "upload" ? (
      <UploadCloud className="w-4 h-4" />
    ) : (
      <Download className="w-4 h-4" />
    );

  return (
    <li className="h-12 flex items-center justify-between gap-4">
      {typeIcon}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-sm text-gray-800">
          <span className="flex items-center gap-1 truncate">
            {name} <span className="text-xs text-gray-800 ml-1">({size})</span>
          </span>
          <span>{item.progress}%</span>
        </div>
        <Progress value={item.progress} status={item.status} />
      </div>

      <div className="flex gap-1">
        {item.status === "success" && (
          <button
            type="button"
            onClick={() => removeTransfer(item.id)}
            className="text-muted-foreground p-1 hover:text-muted"
            title="삭제"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}

        {(item.status === "inProgress" || item.status === "pending") && (
          <button
            type="button"
            onClick={cancelItem}
            className="text-muted-foreground p-1 hover:text-muted"
            title="취소"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}

        {(item.status === "error" || item.status === "cancelled") && (
          <>
            <button
              type="button"
              onClick={retryItem}
              className="text-muted-foreground p-1 hover:text-muted"
              title="재시작"
            >
              <RotateCcwIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => removeTransfer(item.id)}
              className="text-muted-foreground p-1 hover:text-muted"
              title="삭제"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}
