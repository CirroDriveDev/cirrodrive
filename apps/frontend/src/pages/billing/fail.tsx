import { useNavigate } from "react-router";
import { Button } from "#shadcn/components/Button.js";

export function Fail(): JSX.Element {
  const navigate = useNavigate();

  const handleRetry = () => {
    void navigate("/mypage/plans"); // 요금제 페이지로
  };

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-6 p-4">
      <h1 className="text-4xl font-extrabold text-red-700">결제 실패</h1>
      <p className="max-w-2xl text-center text-lg text-red-600">
        죄송합니다. 결제에 실패하였습니다. 잠시 후 다시 시도하거나 고객 지원에
        문의해 주세요.
      </p>
      <Button
        variant="default"
        onClick={handleRetry}
        className="bg-red-600 px-8 py-3 font-bold text-white hover:bg-red-700"
      >
        요금제 페이지로 돌아가기
      </Button>
    </div>
  );
}
