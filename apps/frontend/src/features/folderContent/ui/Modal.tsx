import { X } from "lucide-react";
import type React from "react";

export function Modal({
  isOpen,
  closeModal,
  children,
}: {
  isOpen: boolean;
  closeModal: () => void;
  children: React.ReactNode;
}): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 flex h-[250px] w-[400px] flex-col rounded border bg-white shadow">
      <div className="h-10 bg-blue-600">
        <button
          type="button"
          className="bg-red-500 px-2 py-2 text-white"
          onClick={closeModal}
        >
          <X />
        </button>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
