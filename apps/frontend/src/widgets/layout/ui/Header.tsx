import { Link } from "react-router-dom";
import { Navbar } from "@/widgets/layout/ui/NavBar.tsx";

export function Header(): JSX.Element {
  return (
    <header className="sticky top-0 flex h-16 w-full items-center justify-between bg-sky-900 px-8 py-2 text-white lg:px-32 xl:px-64">
      <Link
        className="flex h-16 items-center justify-between gap-4 px-0 text-center text-white"
        to="/"
      >
        <img className="size-16 rounded-full" src="/cloud.jpg" alt="cloud" />
        실습 사이트
      </Link>
      <Navbar />
      <ul className="m-0 flex list-none py-0">
        <li className="px-4 py-2">
          <Link className="text-white no-underline" to="/Signup">
            회원가입
          </Link>
        </li>
        <li className="px-4 py-2">
          <Link className="text-white no-underline" to="/Login">
            로그인
          </Link>
        </li>
      </ul>
    </header>
  );
}
