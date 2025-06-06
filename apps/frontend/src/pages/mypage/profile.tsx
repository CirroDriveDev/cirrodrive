import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { MyPlanSection } from "#components/MyPlanSection.js";
import { PaymentHistorySection } from "#components/PaymentHistorySection.js"; // ✅ 추가
import { Button } from "#shadcn/components/Button.js";

export function MyPage(): JSX.Element {
  const navigate = useNavigate();

  const handleChangePasswordClick = () => {
    toast.info("비밀번호 변경 페이지로 이동합니다."); // 알림
    void navigate("/changspassword");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <h1 className="text-3xl font-bold">마이페이지</h1>
      <MyPlanSection />
      <PaymentHistorySection /> {/* ✅ 결제 내역 섹션 추가 */}
      {/* 비밀번호 재설정 페이지 버튼 */}
      <div className="flex justify-center">
        <Button onClick={handleChangePasswordClick} variant="default">
          비밀번호 변경
        </Button>
      </div>
    </div>
  );
}
