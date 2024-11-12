import { Link } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/Button.tsx";

export function Sidebar(): JSX.Element {
  return (
    <aside className="flex flex-grow bg-secondary">
      <nav className="flex flex-grow flex-col space-y-4 p-4">
        <Button variant="ghost">
          <Link to="#" className="flex-grow">
            모든 파일
          </Link>
        </Button>
        <Button variant="ghost">
          <Link to="#" className="flex-grow">
            휴지통
          </Link>
        </Button>
      </nav>
    </aside>
  );
}
