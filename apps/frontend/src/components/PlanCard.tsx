interface PlanCardProps {
  price: string;
  features: string[];
  backgroundColor: string;
  onSubscribe: () => void;
  currentUserLevel: string;
}

export function PlanCard({
  price,
  features,
  backgroundColor,
  onSubscribe,
  currentUserLevel,
}: PlanCardProps): JSX.Element {
  const isFreePlan = price === "무료";
  const isPremiumPlan = price === "4,900원";
  const isVipPlan = price === "9,900원";

  let buttonLabel = "구매하기";
  let buttonDisabled = false;
  let buttonStyle = "bg-white text-gray-800 hover:bg-gray-200";

  if (currentUserLevel === "무료") {
    if (isFreePlan) {
      buttonLabel = "현재 등급";
      buttonDisabled = true;
      buttonStyle = "bg-gray-300 text-gray-700 cursor-default";
    }
  } else if (currentUserLevel === "4,900원") {
    if (isFreePlan) {
      buttonLabel = "X";
      buttonDisabled = true;
      buttonStyle = "bg-gray-300 text-gray-700 cursor-default";
    } else if (isPremiumPlan) {
      buttonLabel = "현재 등급";
      buttonDisabled = true;
      buttonStyle = "bg-gray-300 text-gray-700 cursor-default";
    }
  } else if (currentUserLevel === "9,900원") {
    if (isFreePlan || isPremiumPlan) {
      buttonLabel = "X";
      buttonDisabled = true;
      buttonStyle = "bg-gray-300 text-gray-700 cursor-default";
    } else if (isVipPlan) {
      buttonLabel = "현재 등급";
      buttonDisabled = true;
      buttonStyle = "bg-gray-300 text-gray-700 cursor-default";
    }
  }

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

      {/* 설명 */}
      <ul className="mb-8 flex flex-grow flex-col justify-center space-y-3 text-lg">
        {features.map((feature) => (
          <li key={feature} className="flex items-center space-x-2">
            <span>✔️ {feature}</span>
          </li>
        ))}
      </ul>

      {/* 버튼 */}
      <button
        type="button"
        className={`rounded-full px-6 py-3 font-bold ${buttonStyle}`}
        onClick={() => {
          if (!buttonDisabled) onSubscribe();
        }}
        disabled={buttonDisabled}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
