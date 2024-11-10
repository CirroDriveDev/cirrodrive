import { Link } from "react-router-dom";
import { Logo } from "@/shared/ui/layout/Logo.tsx";
import { SearchBar } from "@/shared/ui/layout/SearchBar.tsx";
import { ModeToggle } from "@/shared/components/shadcn/ModeToggle.tsx";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { useLogout } from "@/shared/api/useLogout.ts";

export function Header(): JSX.Element {
  const { user } = useBoundStore();
  const { logout } = useLogout();
  return (
    <header className="flex flex-grow bg-primary">
      <div className="flex w-[250px] items-center p-4">
        <Link className="flex items-center space-x-2" to="/">
          <Logo />
          <div className="text-2xl font-bold">CirroDrive</div>
        </Link>
      </div>
      <div className="flex flex-grow items-center justify-end p-4">
        <SearchBar />
        <Button variant="ghost" className="ml-auto mr-1">
          <Link to="/upload">업로드</Link>
        </Button>
        <Button variant="ghost" className="mr-1">
          <Link to="/download">다운로드</Link>
        </Button>
        <span className="mr-1 text-xl">|</span>
        {user ?
          <Button variant="ghost" className="mr-1" onClick={logout}>
            로그아웃
          </Button>
        : <>
            <Button variant="ghost" className="mr-1">
              <Link to="/login">로그인</Link>
            </Button>
            <Button variant="ghost" className="mr-1">
              <Link to="/register">회원가입</Link>
            </Button>
          </>
        }
        <ModeToggle />
      </div>
    </header>
  );
}
