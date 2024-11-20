import { useState } from "react";

// SuccessPopup 컴포넌트 정의
function SuccessPopup({ closeModal }: { closeModal: () => void }): JSX.Element {
  return (
    <div className="absolute bottom-0 right-0 h-[250px] w-[400px] bg-green-400">
      <div className="flex h-[40px] flex-row-reverse bg-blue-500">
        <button
          type="button"
          className="h-[40px] w-[50px] text-white hover:text-black"
          onClick={closeModal}
        >
          X
        </button>
      </div>
      <div className="mt-16 grid place-items-center text-xl text-black">
        내용
      </div>
    </div>
  );
}

// ErrorPopup 컴포넌트 정의
function ErrorPopup({ closeModal }: { closeModal: () => void }): JSX.Element {
  return (
    <div className="absolute bottom-0 right-0 h-[250px] w-[400px] bg-red-400">
      <div className="flex h-[40px] flex-row-reverse bg-blue-500">
        <button
          type="button"
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

export function Popup(): JSX.Element {
  const [isError, setIsError] = useState(false); // 오류 상태
  const [isOpen, setIsOpen] = useState(false); // 팝업 열림 상태

  const handleUpload = (): void => {
    // 실제 업로드 성공 또는 실패 조건을 구현
    const uploadSuccess = performUpload(); // 성공 여부를 반환하는 함수 호출
    setIsError(!uploadSuccess); // 오류 상태 업데이트
    setIsOpen(true); // 팝업 열림 상태 업데이트
  };

  const performUpload = (): boolean => {
    // 실제 업로드 로직을 구현하고 성공 여부를 반환  예: 파일 검증, 서버 응답 처리 등 여기서는 간단히 성공을 반환하도록 설정
    //추후 작성
    return true; // 항상 성공
  };

  const closeModal = (): void => {
    setIsOpen(false);
    setIsError(false); // 상태 초기화
  };

  const renderPopup = (): JSX.Element | null => {
    if (!isOpen) return null; // 팝업이 열리지 않은 경우 아무것도 렌더링하지 않음
    return isError ?
        <ErrorPopup closeModal={closeModal} />
      : <SuccessPopup closeModal={closeModal} />;
  };

  return (
    <div>
      <button type="button" onClick={handleUpload}>
        팝업
      </button>
      {renderPopup()}
    </div>
  );
}
