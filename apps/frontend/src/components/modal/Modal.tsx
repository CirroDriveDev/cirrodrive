import { XIcon } from "lucide-react";
import { useModalStore } from "@/store/useModalStore.ts";

export function Modal(): JSX.Element | null {
  const { isOpen, title, content, closeModal } = useModalStore();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="flex w-full max-w-lg flex-col rounded-lg bg-background shadow-lg">
        <div className="flex items-center justify-between rounded-t-lg border-b-[1px] border-b-border bg-accent">
          <h2 className="p-4 text-foreground">{title}</h2>
          <button
            type="button"
            onClick={closeModal}
            className="p-2 text-foreground hover:text-accent"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">{content}</div>
      </div>
    </div>
  );
}
