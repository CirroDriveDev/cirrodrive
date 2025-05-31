import { Link } from "react-router";
import { Button } from "#shadcn/components/Button.js";

export function NotFoundPage(): JSX.Element {
  return (
    <div className="flex w-full flex-grow flex-col items-center justify-center">
      <div className="text-2xl font-bold">404 - Page Not Found</div>
      <div>존재하지 않는 페이지입니다.</div>
      <Link to="/">
        <Button>홈으로 돌아가기</Button>
      </Link>
    </div>
  );
}
