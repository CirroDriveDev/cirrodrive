import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal() {
  // dialog 참조 ref
  const dialogRef = useRef<HTMLDialogElement>(null);

  // modal 오픈 함수
  const showModal = () => {
    dialogRef.current?.showModal(); // 모달창 노출. show() 호출하면 다이얼로그 노출
  };

  // Modal 닫기 함수
  const closeModal = () => {
    dialogRef.current?.close(); // 모달창 닫기
  };

  return (
    <div>
      {/* 모달 노출 버튼 */}
      <button type="button" onClick={showModal}>
        Open Modal
      </button>

      {/* dialog 엘리먼트 - 모달창 영역  */}
      <dialog ref={dialogRef}>
        <div className="h-60">
          <div className="h-8 w-80 bg-blue-600">
            {/* 제목 + X버튼 영역 */}
            <div className="place-self-end">
              <button type="button" onClick={closeModal}>
                <X size={30} color="white" />
              </button>
            </div>
          </div>

          <div className="place-self-center">
            {/* 컨텐츠 영역 */}
            <div className="mt-7">파일이름 :xptmxm vkdlf</div>
            <div className="mt-4">링크 :localhost://5413/upload</div>
            <div className="mt-4">유효기간 :</div>
          </div>

          <div className="absolute bottom-8 left-32">
            {/* 확인 버튼 영역 */}
            <button
              className="w-16 rounded-md bg-blue-500 text-white"
              type="button"
              onClick={closeModal}
            >
              확인
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
