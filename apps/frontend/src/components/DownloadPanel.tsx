import { useEffect, useRef, useState } from "react";
import {
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

export function DownloadPanel() {
  const { transfers, removeTransfer } = useTransferStore();
  const downloads = transfers.filter((item) => item.type === "download");
  const [isVisible, setIsVisible] = useState(true);
  const prevStatuses = useRef(new Map<string, string>());

  useEffect(() => {
    if (downloads.length > 0) {
      setIsVisible(true);
    }
  }, [downloads]);

  useEffect(() => {
    downloads.forEach((item) => {
      const prev = prevStatuses.current.get(item.id);
      if (prev !== item.status) {
        if (item.status === "success") {
          toast.success(`✅ ${item.file.name} 다운로드 완료`);
        } else if (item.status === "error") {
          toast.error(`❌ ${item.file.name} 다운로드 실패`);
        } else if (item.status === "cancelled") {
          toast.warning(`⚠️ ${item.file.name} 다운로드 취소됨`);
        }
        prevStatuses.current.set(item.id, item.status);
      }
    });
  }, [downloads]);

  const clearAllDownloads = () => {
    const count = downloads.length;
    downloads.forEach((item) => removeTransfer(item.id));
    if (count > 0) {
      toast.info(`🧹 ${count}개의 항목이 모두 삭제되었습니다`);
    } else {
      toast.message("삭제할 항목이 없습니다");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-96">
      <Collapsible asChild className="group/collapsible">
        <Card className="flex-grow">
          <CardHeader className="p-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">다운로드 중인 파일</CardTitle>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearAllDownloads}
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
                {downloads.map((item) => (
                  <DownloadItem key={item.id} item={item} />
                ))}
              </ul>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

function DownloadItem({ item }: { item: FileTransfer }) {
  const name = item.file.name;
  const size = formatSize(item.totalBytes ?? 0);
  const { removeTransfer, setStatus } = useTransferStore();

  const cancelItem = () => {
    item.cancel();
    setStatus(item.id, "cancelled");
    toast.warning(`⚠️ ${item.file.name} 다운로드 취소됨`);
  };

  const retryItem = () => {
    item.retry();
    removeTransfer(item.id);
    toast.info(`🔁 ${item.file.name} 재시작됨`);
  };

  return (
    <li className="flex h-12 items-center justify-between gap-4">
      <Download className="h-4 w-4" />
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
