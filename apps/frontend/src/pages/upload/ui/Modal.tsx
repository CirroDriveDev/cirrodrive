import { useState } from "react";

// <Mo
export function Modal({
  buttonText = "모달 열기",
}: {
  buttonText?: string;
}): JSX.Element {
  const [isOpen, setIsOpen] = useState(false); // 초기값은 false

  const openModal = (): void => {
    setIsOpen(true); // 모달 열기
  };

  const closeModal = (): void => {
    setIsOpen(false); // 모달 닫기
  };

  const renderModalContent = (): JSX.Element | null => {
    if (!isOpen) return null;

    return (
      <div className="absolute bottom-0 right-0 h-[250px] w-[400px] border">
        <div className="bg-blue-600">
          <div className="justify-self-end">
            <button
              type="button"
              className="rounded-sm bg-red-500 px-2 py-1 text-white"
              onClick={closeModal}
            >
              X
            </button>
          </div>
        </div>
        <div className="mt-10 text-center">내용</div>
      </div>
    );
  };

  return (
    <div>
      <button
        className="h-10 w-16 rounded-md bg-blue-500 text-white"
        type="button"
        onClick={openModal}
      >
        {buttonText}
      </button>

      {/* 모달창 렌더링 */}
      {renderModalContent()}
    </div>
  );
}
