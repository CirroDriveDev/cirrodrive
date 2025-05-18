import { Button } from "@/shadcn/components/Button.tsx";

export interface PlanCardProps {
  price: string;
  features: string[];
  backgroundColor: string;
  onSubscribe: () => void;
}

export function PlanCard({
  price,
  features,
  backgroundColor,
  onSubscribe,
}: PlanCardProps): JSX.Element {
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

      {/* 구매 버튼 */}
      <Button
        variant="default"
        onClick={onSubscribe}
        className="rounded-full px-6 py-3 font-bold"
      >
        구매하기
      </Button>
    </div>
  );
}
