import { Link } from "react-router";
import { ModeToggle } from "#shadcn/components/ModeToggle.js";
import { NavButton } from "#components/layout/NavButton.js";
import { CommonSidebarHeader } from "#components/layout/CommonSidebarHeader.js";

export function GuestHeader(): JSX.Element {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-primary">
      <CommonSidebarHeader />
      <div className="flex-grow" />
      <div className="flex space-x-4 items-center">
        <Link to="/upload">
          <NavButton>업로드</NavButton>
        </Link>
        <Link to="/download">
          <NavButton>다운로드</NavButton>
        </Link>
        <Link to="/login">
          <NavButton>로그인</NavButton>
        </Link>
        <Link to="/register">
          <NavButton>회원가입</NavButton>
        </Link>
        <ModeToggle />
      </div>
    </header>
  );
}
