import { Button } from "@/shadcn/components/Button.tsx";

export interface PlanCardProps {
  price: "무료" | "4,900원" | "9,900원";
  features: string[];
  backgroundColor: string;
  onSubscribe: () => void;
  currentUserLevel: "무료" | "4,900원" | "9,900원";
}

export function PlanCard({
  price,
  features,
  backgroundColor,
  onSubscribe,
  currentUserLevel,
}: PlanCardProps): JSX.Element {
  const isCurrentPlan = price === currentUserLevel; // 현재 요금제인지 확인

  // 현재 요금제보다 낮은 요금제의 버튼은 렌더링하지 않음
  const shouldRenderButton =
    !isCurrentPlan &&
    ["무료", "4,900원", "9,900원"].indexOf(price) >
      ["무료", "4,900원", "9,900원"].indexOf(currentUserLevel);

  return (
    <div
      className="flex flex-col items-center rounded-xl p-8 text-white shadow-xl"
      style={{
        backgroundColor,
        minWidth: "320px",
        minHeight: "480px",
      }}
    >
      {/* 가격 */}
      <div className="mb-6 text-3xl font-extrabold">월/{price}</div>

      {/* 요금제 설명 */}
      <ul className="mb-8 flex flex-grow flex-col justify-center space-y-3 text-lg">
        {features.map((feature) => (
          <li key={feature} className="flex items-center space-x-2">
            <span>✔️ {feature}</span>
          </li>
        ))}
      </ul>

      {/* 현재 요금제 표시 */}
      {isCurrentPlan ?
        <Button
          variant="secondary"
          disabled // 현재 사용 중인 요금제라서 비활성화
          className="rounded-full px-6 py-3 font-bold"
        >
          현재 요금제
        </Button>
      : null}

      {/* 버튼 렌더링 여부에 따라 표시 */}
      {shouldRenderButton ?
        <Button
          variant="default"
          onClick={onSubscribe}
          className="rounded-full px-6 py-3 font-bold"
        >
          구매하기
        </Button>
      : null}
    </div>
  );
}
