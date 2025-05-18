import { useNavigate } from "react-router";
import { Button } from "@/shadcn/components/Button.tsx";
import { usePaymentSuccess } from "@/hooks/usePaymentSuccess.ts";

export function Success(): JSX.Element | null {
  const navigate = useNavigate();
  const { isPending, isSuccess, error } = usePaymentSuccess();

  const handleGoHome = () => {
    void navigate("/subscribe"); // 요금제 페이지로
  };

  if (isPending) {
    return <div>결제 처리 중...</div>;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-6 bg-red-50 p-4">
        <h1 className="text-4xl font-extrabold text-red-700">결제 인증 실패</h1>
        <p className="max-w-2xl text-center text-lg text-red-600">
          결제 인증에 실패하였습니다. 잠시 후 다시 이용해주세요.
        </p>
        <Button
          variant="default"
          onClick={() => navigate("/subscribe")}
          className="bg-red-600 px-8 py-3 font-bold text-white hover:bg-red-700"
        >
          요금제 페이지로 돌아가기
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-6 bg-green-50 p-4">
        <h1 className="text-4xl font-extrabold text-green-700">결제 성공</h1>
        <p className="max-w-2xl text-center text-lg text-green-600">
          결제가 성공적으로 완료되었습니다. 서비스가 즉시 활성화되었습니다.
        </p>
        <Button
          variant="default"
          onClick={handleGoHome}
          className="bg-green-600 px-8 py-3 font-bold text-white hover:bg-green-700"
        >
          홈으로 가기
        </Button>
      </div>
    );
  }

  return null;
}
