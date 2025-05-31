import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { SidebarLayout } from "#components/layout/SidebarLayout.js";
import { Header } from "#components/layout/Header.js";
import { Sidebar } from "#components/layout/Sidebar.js";
import { MyPlanSection } from "#pages/mypage/myplansection.js";
import { PaymentHistorySection } from "#pages/mypage/paymenthistorysection.js"; // ✅ 추가
import { Button } from "#shadcn/components/Button.js";

export function MyPage(): JSX.Element {
  const navigate = useNavigate();

  const handleChangePasswordClick = () => {
    toast.info("비밀번호 변경 페이지로 이동합니다."); // 알림
    void navigate("/changspassword");
  };

  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
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
    </SidebarLayout>
  );
}
