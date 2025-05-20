import { useBoundStore } from "#store/useBoundStore.js";
import type { ModalStore } from "#store/useBoundStore.js";

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
