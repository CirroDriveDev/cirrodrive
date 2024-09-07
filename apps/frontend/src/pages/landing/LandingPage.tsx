import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/Button.tsx";

export function LandingPage(): JSX.Element {
  return (
    <div className="flex flex-grow flex-col items-center justify-center">
      <div>아직 미완성 상태인 랜딩 페이지입니다.</div>
      <Button>
        <Link to="/home">홈으로 이동</Link>
      </Button>
    </div>
  );
}
