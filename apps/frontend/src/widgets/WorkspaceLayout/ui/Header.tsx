import { Link } from "react-router-dom";
import { Logo } from "@/widgets/WorkspaceLayout/ui/Logo.tsx";
import { SearchBar } from "@/widgets/WorkspaceLayout/ui/SearchBar.tsx";
import { ModeToggle } from "@/shared/components/ModeToggle.tsx";

export function Header(): JSX.Element {
  return (
    <header className="bg-primary flex flex-grow">
      <div className="flex w-[250px] items-center p-4">
        <Link className="flex items-center space-x-2 text-white" to="/home">
          <Logo />
          <div className="text-2xl font-bold">CirroDrive</div>
        </Link>
      </div>
      <div className="flex flex-grow items-center justify-between p-4">
        <SearchBar />
        <ModeToggle />
      </div>
    </header>
  );
}
