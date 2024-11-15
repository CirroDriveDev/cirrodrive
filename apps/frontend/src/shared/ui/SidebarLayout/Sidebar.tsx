import { Upload, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/Button.tsx";

export function Sidebar(): JSX.Element {
  return (
    <aside className="flex flex-grow bg-secondary">
      <nav className="flex flex-grow flex-col space-y-4 p-4">
        <Button variant="ghost">
          <Link to="/upload" className="flex flex-grow items-center">
            <Upload size={24} className="mr-5" />
            업로드
          </Link>
        </Button>
        <Button variant="ghost">
          <Link to="/download" className="flex flex-grow items-center">
            <Download size={24} className="mr-5" />
            다운로드
          </Link>
        </Button>
      </nav>
    </aside>
  );
}
