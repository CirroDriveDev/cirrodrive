import { useNavigate } from "react-router";
import { trpc } from "#services/trpc.js";
import { Button } from "#shadcn/components/Button.js";

export function Success(): JSX.Element | null {
  const navigate = useNavigate();
  const currentPlan = trpc.billing.getCurrentPlan.useQuery();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          서비스를 이용해주셔서 감사합니다!
        </h1>
        <p className="text-lg mb-2">
          {currentPlan.data?.name}으로 요금제 변경이 완료되었습니다.
        </p>
        <p className="text-lg mb-4">새로운 요금제를 이용해 주세요.</p>
        <Button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {
            void navigate("/mypage/plans");
          }}
        >
          요금제 관리로 이동
        </Button>
      </div>
    </div>
  ); // 로딩 스피너를 보여줍니다.
}
