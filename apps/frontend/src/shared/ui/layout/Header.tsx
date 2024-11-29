import { Link } from "react-router-dom";
import { Logo } from "@/shared/ui/layout/Logo.tsx";
import { SearchBar } from "@/shared/ui/layout/SearchBar.tsx";
import { ModeToggle } from "@/shared/components/shadcn/ModeToggle.tsx";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { useLogout } from "@/shared/api/useLogout.ts";

interface HeaderProps {
  onSearch: (searchTerm: string) => void; // 검색어 처리함
}

export function Header({ onSearch }: HeaderProps): JSX.Element {
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
        <SearchBar onSearch={onSearch} />
        {user ?
          <Button variant="ghost" className="mr-1" onClick={logout}>
            로그아웃
          </Button>
        : <>
            <Link to="/upload">
              <Button variant="ghost" className="ml-auto mr-1">
                업로드
              </Button>
            </Link>
            <Link to="/download">
              <Button variant="ghost" className="mr-1">
                다운로드
              </Button>
            </Link>
            <span className="mr-1 text-xl">|</span>
            <Link to="/login">
              <Button variant="ghost" className="mr-1">
                로그인
              </Button>
            </Link>

            <Link to="/register">
              <Button variant="ghost" className="mr-1">
                회원가입
              </Button>
            </Link>
          </>
        }
        <ModeToggle />
      </div>
    </header>
  );
}
