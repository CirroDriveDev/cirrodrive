import { Link } from "react-router-dom";
import { Logo } from "@/widgets/WorkspaceLayout/ui/Logo.tsx";
import { SearchBar } from "@/widgets/WorkspaceLayout/ui/SearchBar.tsx";
import { ModeToggle } from "@/shared/components/ModeToggle.tsx";
import { Button } from "@/shared/ui/Button.tsx";

export function Header(): JSX.Element {
  return (
    <header className="flex flex-grow bg-primary">
      <div className="flex w-[250px] items-center p-4">
        <Link className="flex items-center space-x-2 text-white" to="/">
          <Logo />
          <div className="text-2xl font-bold">CirroDrive</div>
        </Link>
      </div>
      <div className="flex flex-grow items-center justify-end p-4">
        <SearchBar />
        <Button variant="ghost" className="ml-auto mr-1 text-white">
          <Link to="/upload">업로드</Link>
        </Button>
        <Button variant="ghost" className="mr-1 text-white">
          <Link to="/download">다운로드</Link>
        </Button>
        <span className="mr-1 text-xl text-white">|</span>
        <Button variant="ghost" className="mr-1 text-white">
          <Link to="/login">로그인</Link>
        </Button>
        <Button variant="ghost" className="mr-1 text-white">
          <Link to="/signup">회원가입</Link>
        </Button>
        <ModeToggle />
      </div>
    </header>
  );
}
