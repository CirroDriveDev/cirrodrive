import { useNavigate } from "react-router";
import { Button } from "@/shadcn/components/Button.tsx";

export function Success(): JSX.Element {
  const navigate = useNavigate();

  const handleGoHome = () => {
    void navigate("folder/:folderId"); // 회원의 처음 화면으로
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6 bg-green-50 p-4">
      <h1 className="text-4xl font-extrabold text-green-700">결제 성공</h1>
      <p className="max-w-2xl text-center text-lg text-green-600">
        결제가 성공적으로 완료되었습니다. 서비스가 즉시 활성화되어 이용할 수
        있습니다. 이용해 주셔서 감사합니다!
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
