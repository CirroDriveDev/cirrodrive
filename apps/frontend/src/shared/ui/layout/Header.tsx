import { Link } from "react-router-dom";
import { Logo } from "@/shared/ui/layout/Logo.tsx";
import { SearchBar } from "@/shared/ui/layout/SearchBar.tsx";
import { ModeToggle } from "@/shared/components/shadcn/ModeToggle.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { useLogout } from "@/shared/api/useLogout.ts";
import { NavButton } from "@/shared/ui/layout/NavButton.tsx";

export function Header(): JSX.Element {
  const { user } = useBoundStore();
  const { logout } = useLogout();

  return (
    <header className="flex flex-grow bg-primary">
      <div className="flex w-[250px] items-center p-4">
        <Link className="flex items-center space-x-2" to="/">
          <Logo />
          <div className="font-orbitron font-700 text-2xl text-white">
            Cirrodrive
          </div>
        </Link>
      </div>
      {user ?
        <div className="flex flex-grow items-center justify-between px-4">
          <SearchBar />

          <div className="flex space-x-4">
            <NavButton onClick={logout}>로그아웃</NavButton>
            <ModeToggle />
          </div>
        </div>
      : <div className="flex flex-grow items-center justify-between px-4">
          <div className="flex space-x-4">
            <Link to="/upload">
              <NavButton>업로드</NavButton>
            </Link>
            <Link to="/download">
              <NavButton>다운로드</NavButton>
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link to="/login">
              <NavButton>로그인</NavButton>
            </Link>

            <Link to="/register">
              <NavButton>회원가입</NavButton>
            </Link>
            <ModeToggle />
          </div>
        </div>
      }
    </header>
  );
}
