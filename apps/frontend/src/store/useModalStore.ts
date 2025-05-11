import { useBoundStore } from "@/store/useBoundStore.ts";
import type { ModalStore } from "@/store/useBoundStore.ts";

export const useModalStore = (): ModalStore => {
  const { isOpen, title, content, openModal, closeModal } = useBoundStore();

  return {
    isOpen,
    title,
    content,
    openModal,
    closeModal,
  };
};
