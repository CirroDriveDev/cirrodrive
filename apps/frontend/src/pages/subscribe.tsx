import { PlanCard } from "@/components/PlanCard.tsx";

export function Subscribe(): JSX.Element {
  const currentUserLevel: "무료" | "4,900원" | "9,900원" = "9,900원"; // 현재 회원의 요금제 설정

  const plans: {
    id: string;
    price: "무료" | "4,900원" | "9,900원";
    features: string[];
    backgroundColor: string;
  }[] = [
    {
      id: "basic",
      price: "무료",
      features: ["기본 저장소", "기본 업로드 속도", "기본 다운로드 속도"],
      backgroundColor: "#6c757d",
    },
    {
      id: "premium",
      price: "4,900원",
      features: ["많은 저장소", "향상된 업로드 속도", "향상된 다운로드 속도"],
      backgroundColor: "#5bc0de",
    },
    {
      id: "vip",
      price: "9,900원",
      features: ["압도적 저장소", "빠른 업로드 속도", "빠른 다운로드 속도"],
      backgroundColor: "#007bff",
    },
  ];

  const handleSubscribe = () => {
    //결제
  };

  return (
    <div className="flex min-h-screen flex-row items-center justify-center gap-8">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          price={plan.price}
          features={plan.features}
          backgroundColor={plan.backgroundColor}
          onSubscribe={() => handleSubscribe()} // 결제
          currentUserLevel={currentUserLevel}
        />
      ))}
    </div>
  );
}
