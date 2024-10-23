import { Wrench } from "lucide-react";

export function CodePage(): JSX.Element {
  return (
    <div className="flex flex-col">
      <div className="fixed flex h-[40px] w-full flex-row bg-blue-600">
        <Wrench size={40} className="absolute left-3 top-0 text-white" />
        <div className="absolute left-16 text-2xl text-white">Code</div>
      </div>
      <div>
        <div className="absolute left-[100px] top-[100px]">파일 이름</div>
        <div className="absolute left-[400px] top-[100px]">코드 자리</div>
        <div className="absolute left-[700px] top-[100px]">남은 날짜</div>
      </div>
    </div>
  );
}
