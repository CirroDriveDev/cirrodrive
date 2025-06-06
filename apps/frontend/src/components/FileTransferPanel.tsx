import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  Download,
  ChevronUp,
  RotateCcwIcon,
  XIcon,
  Trash2,
} from "lucide-react";
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
  const [isVisible, setIsVisible] = useState(false);
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
        prevStatuses.current.set(item.id, item.status);
      }
    });
  }, [transfers]);

  const clearAllTransfers = () => {
    transfers.forEach((item) => removeTransfer(item.id));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex w-96">
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
                  <Trash2 className="h-5 w-5" />
                </button>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="text-foreground hover:text-muted-foreground"
                  >
                    <ChevronUp className="h-6 w-6 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </button>
                </CollapsibleTrigger>
                <button
                  type="button"
                  onClick={() => setIsVisible(false)}
                  className="text-foreground hover:text-muted-foreground"
                  title="패널 닫기"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </CardHeader>

          <CollapsibleContent asChild>
            <CardContent>
              <ul className="custom-scrollbar max-h-60 min-h-12 overflow-y-auto pr-4">
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
  };

  const retryItem = () => {
    item.retry();
    removeTransfer(item.id);
  };

  const typeIcon =
    item.type === "upload" ?
      <UploadCloud className="h-4 w-4" />
    : <Download className="h-4 w-4" />;

  return (
    <li className="flex h-12 items-center justify-between gap-4">
      {typeIcon}
      <div className="min-w-0 flex-1">
        <div className="flex justify-between text-sm text-gray-800">
          <span className="flex items-center gap-1 truncate">
            {name} <span className="ml-1 text-xs text-gray-800">({size})</span>
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
            className="p-1 text-muted-foreground hover:text-muted"
            title="삭제"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}

        {(item.status === "inProgress" || item.status === "pending") && (
          <button
            type="button"
            onClick={cancelItem}
            className="p-1 text-muted-foreground hover:text-muted"
            title="취소"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}

        {(item.status === "error" || item.status === "cancelled") && (
          <>
            <button
              type="button"
              onClick={retryItem}
              className="p-1 text-muted-foreground hover:text-muted"
              title="재시작"
            >
              <RotateCcwIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => removeTransfer(item.id)}
              className="p-1 text-muted-foreground hover:text-muted"
              title="삭제"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}
