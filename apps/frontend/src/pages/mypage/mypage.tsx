import { SidebarLayout } from "#components/layout/SidebarLayout.js";
import { Header } from "#components/layout/Header.js";
import { Sidebar } from "#components/layout/Sidebar.js";
import { MyPlanSection } from "#pages/mypage/myplansection.js";
import { PaymentHistorySection } from "#pages/mypage/paymenthistorysection.js"; // ✅ 추가

export function MyPage(): JSX.Element {
  return (
    <SidebarLayout
      header={<Header />}
      sidebar={<Sidebar />}
    >
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">마이페이지</h1>
        <MyPlanSection />
        <PaymentHistorySection /> {/* ✅ 결제 내역 섹션 추가 */}
      </div>
    </SidebarLayout>
  );
}
