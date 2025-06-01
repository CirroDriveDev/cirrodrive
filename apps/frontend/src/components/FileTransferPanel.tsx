/* eslint-disable no-console -- development */
import { useEffect, useState } from "react";
import {
  UploadCloud,
  Download,
  ChevronUp,
  RotateCcwIcon,
  XIcon,
} from "lucide-react";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import type { FileTransfer } from "#types/file-transfer";
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

export function TransferPanel() {
  // const { transfers } = useTransferStore();

  // mock transfers for development
  const transfers: FileTransfer[] = [
    {
      id: "1",
      type: "upload",
      file: new File([""], "example.txt"),
      progress: 50,
      transferredBytes: 500,
      totalBytes: 1000,
      status: "error",
      error: undefined,
      retry: () => console.log("Retry upload"),
      cancel: () => console.log("Cancel upload"),
    },
    {
      id: "2",
      type: "download",
      file: { name: "example.jpg", size: 2000 },
      progress: 75,
      transferredBytes: 1500,
      totalBytes: 2000,
      status: "cancelled",
      error: undefined,
      retry: () => console.log("Retry download"),
      cancel: () => console.log("Cancel download"),
    },
    {
      id: "3",
      type: "download",
      file: { name: "example.jpg", size: 2000 },
      progress: 100,
      transferredBytes: 1500,
      totalBytes: 2000,
      status: "success",
      error: undefined,
      retry: () => console.log("Retry download"),
      cancel: () => console.log("Cancel download"),
    },
    {
      id: "4",
      type: "download",
      file: { name: "example.jpg", size: 2000 },
      progress: 0,
      transferredBytes: 1500,
      totalBytes: 2000,
      status: "pending",
      error: undefined,
      retry: () => console.log("Retry download"),
      cancel: () => console.log("Cancel download"),
    },
    {
      id: "5",
      type: "download",
      file: { name: "example.jpg", size: 2000 },
      progress: 75,
      transferredBytes: 1500,
      totalBytes: 2000,
      status: "inProgress",
      error: undefined,
      retry: () => console.log("Retry download"),
      cancel: () => console.log("Cancel download"),
    },
    {
      id: "6",
      type: "download",
      file: { name: "example.jpg", size: 2000 },
      progress: 0,
      transferredBytes: 1500,
      totalBytes: 2000,
      status: "pending",
      error: undefined,
      retry: () => console.log("Retry download"),
      cancel: () => console.log("Cancel download"),
    },
    {
      id: "7",
      type: "download",
      file: { name: "example.jpg", size: 2000 },
      progress: 75,
      transferredBytes: 1500,
      totalBytes: 2000,
      status: "inProgress",
      error: undefined,
      retry: () => console.log("Retry download"),
      cancel: () => console.log("Cancel download"),
    },
    {
      id: "8",
      type: "download",
      file: { name: "example.jpg", size: 2000 },
      progress: 0,
      transferredBytes: 1500,
      totalBytes: 2000,
      status: "pending",
      error: undefined,
      retry: () => console.log("Retry download"),
      cancel: () => console.log("Cancel download"),
    },
    {
      id: "9",
      type: "download",
      file: { name: "example.jpg", size: 2000 },
      progress: 75,
      transferredBytes: 1500,
      totalBytes: 2000,
      status: "inProgress",
      error: undefined,
      retry: () => console.log("Retry download"),
      cancel: () => console.log("Cancel download"),
    },
  ];

  const [isVisible, setIsVisible] = useState(transfers.length > 0);

  useEffect(() => {
    setIsVisible(transfers.length > 0);
  }, [transfers.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 w-96 z-50 flex">
      <Collapsible asChild className="group/collapsible">
        <Card className="flex-grow">
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">전송 중인 파일</CardTitle>
              <div className="flex-grow" />
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="text-foreground hover:text-muted-foreground"
                >
                  <ChevronUp className="w-7 h-7 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </button>
              </CollapsibleTrigger>
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                className="text-foreground hover:text-muted-foreground"
              >
                <XIcon className="w-7 h-7" />
              </button>
            </div>
          </CardHeader>

          <CollapsibleContent asChild>
            <CardContent>
              <ul className="min-h-12 max-h-60 overflow-y-auto custom-scrollbar pr-4">
                {transfers.map((item) => (
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
  const { removeTransfer } = useTransferStore();

  const removeItem = () => {
    removeTransfer(item.id);
  };

  const cancelItem = () => {
    item.cancel();
    removeTransfer(item.id);
  };

  const retryItem = () => {
    item.retry();
    removeTransfer(item.id);
  };

  const typeIcon =
    item.type === "upload" ?
      <UploadCloud className="w-4 h-4" />
    : <Download className="w-4 h-4" />;

  const actionData: ActionButtonData = {
    success: {
      onClick: removeItem,
      icon: <XIcon className="w-4 h-4" />,
    },
    inProgress: {
      onClick: cancelItem,
      icon: <XIcon className="w-4 h-4" />,
    },
    pending: {
      onClick: cancelItem,
      icon: <XIcon className="w-4 h-4" />,
    },
    error: {
      onClick: retryItem,
      icon: <RotateCcwIcon className="w-4 h-4" />,
    },
    cancelled: {
      onClick: retryItem,
      icon: <RotateCcwIcon className="w-4 h-4" />,
    },
  }[item.status];

  return (
    <li className="h-12 flex items-center justify-between gap-4">
      {typeIcon}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1 truncate">{name}</span>
          <span>{item.progress}%</span>
        </div>

        <Progress value={item.progress} status={item.status} />
      </div>

      <FileTransferActionButton action={actionData} />
    </li>
  );
}

interface ActionButtonData {
  onClick: () => void;
  icon: JSX.Element;
}

interface FileTransferActionButtonProps {
  action: ActionButtonData;
}

function FileTransferActionButton({ action }: FileTransferActionButtonProps) {
  if (!action) return null;

  return (
    <button
      type="button"
      onClick={action.onClick}
      className="text-muted-foreground p-1 hover:text-muted"
    >
      {action.icon}
    </button>
  );
}
