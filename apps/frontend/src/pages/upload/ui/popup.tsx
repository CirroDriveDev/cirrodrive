import React, { useRef, useState } from "react";

export default function Popup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isError, setIsError] = useState(false);

  const showModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };
  //업로드 성공 페이지
  function SuccessPopup() {
    return (
      <div className="absolute bottom-0 right-0 h-[250px] w-[400px] bg-green-400">
        <div className="flex h-[40px] flex-row-reverse bg-blue-500">
          <button
            className="h-[40px] w-[50px] text-white hover:text-black"
            onClick={closeModal}
          >
            X
          </button>
        </div>
        <div className="mt-16 grid place-items-center text-xl text-black">
          <div>파일 이름: </div>
          <div>링크: </div>
          <div>유효 기간: </div>
        </div>
      </div>
    );
  }
  //업로드 실패 페이지
  function ErrorPopup() {
    return (
      <div className="absolute bottom-0 right-0 h-[250px] w-[400px] bg-green-400">
        <div className="flex h-[40px] flex-row-reverse bg-blue-500">
          <button
            className="h-[40px] w-[50px] text-white hover:text-black"
            onClick={closeModal}
          >
            X
          </button>
        </div>
        <div className="mt-16 grid place-items-center text-xl text-black">
          <div>업로드 실패!</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={showModal}>업로드</button>
      {isOpen ?
        <SuccessPopup />
      : null}
      {isError ?
        <ErrorPopup />
      : null}
    </div>
  );
}
