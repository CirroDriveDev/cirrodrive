import { Link } from "react-router-dom";
import { Logo } from "@/components/layout/Logo.tsx";
import { SearchBar } from "@/components/layout/SearchBar.tsx";
import { ModeToggle } from "@/shadcn/components/ModeToggle.tsx";
import { useBoundStore } from "@/store/useBoundStore.ts";
import { useLogout } from "@/services/useLogout.ts";
import { NavButton } from "@/components/layout/NavButton.tsx";
import { useDeleteAccount } from "@/services/useDeleteAccount.ts";

export function Header(): JSX.Element {
  const { user } = useBoundStore();
  const { logout } = useLogout();
  const { deleteAccount } = useDeleteAccount();

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
            <Link to="/download">
              <NavButton>다운로드</NavButton>
            </Link>
            <NavButton onClick={logout}>로그아웃</NavButton>
            <NavButton onClick={deleteAccount}>계정 탈퇴</NavButton>
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
            <Link to="/admin/login">
              <NavButton>관리자 로그인</NavButton>
            </Link>
            <Link to="/login">
              <NavButton>로그인</NavButton>
            </Link>

            <Link to="/register">
              <NavButton>회원가입</NavButton>
            </Link>
            <Link to="/findname">
              <NavButton>아이디 찾기</NavButton>
            </Link>
            <Link to="/findpassword">
              <NavButton>비밀번호 찾기</NavButton>
            </Link>
            <ModeToggle />
          </div>
        </div>
      }
    </header>
  );
}
