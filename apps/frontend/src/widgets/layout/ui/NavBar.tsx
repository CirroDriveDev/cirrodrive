import { Link } from "react-router-dom";

export function Navbar(): JSX.Element {
  return (
    <ul className="m-0 flex list-none py-0">
      <li className="px-4 py-2">
        <Link to="#" className="text-white no-underline">
          커뮤니티
        </Link>
      </li>
      <li className="px-4 py-2">
        <Link to="#" className="text-white no-underline">
          정보
        </Link>
      </li>
      <li className="px-4 py-2">
        <Link to="#" className="text-white no-underline">
          질문
        </Link>
      </li>
      <li className="px-4 py-2">
        <Link to="#" className="text-white no-underline">
          공지사항
        </Link>
      </li>
    </ul>
  );
}
