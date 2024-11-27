import { Header } from "@/shared/ui/layout/Header.tsx";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { DragAndDropUpload } from "@/features/folderContent/ui/DragAndDropUpload.tsx";

export function UploadByCodePage(): JSX.Element {
  return (
    // TODO: 반응형 UI 구현
    <Layout header={<Header />}>
      <div className="w-full">
        <div className="flex h-[720px] items-center justify-center">
          <div className="bg-gray-50">
            <DragAndDropUpload
              // 전체 컨테이너의 레이아웃 및 스타일 설정
              containerClassName="flex flex-col gap-6"
              // 파일 드래그 앤 드롭 영역의 크기와 스타일 설정
              fileAreaClassName="flex h-96 w-96 items-center justify-center rounded border-2 border-dashed transition"
              // 업로드 버튼의 색상, 크기, 모서리 스타일, hover 효과를 한 번에 정의
              buttonClassName="rounded bg-blue-600 hover:bg-blue-500 px-40 py-3 text-lg text-white"
              // 파일 선택 버튼의 스타일을 정의
              fileButtonClassName="rounded bg-blue-600 hover:bg-blue-500 px-36 py-3 text-lg text-white"
              // input 창의 스타일을 정의 (w-full: 가로 폭 100%, max-w-md: 최대 가로 폭을 설정)
              inputClassName="block w-full max-w-md hidden"
              // 오류 메시지의 스타일을 정의 (빨간색, 텍스트 크기 및 여백 설정)
              errorClassName="text-red-600 text-base mt-2"
              // 가로 세로 방향
              directionClassName="flex flex-col gap-6"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
