import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/widgets/WorkspaceLayout/ui/Header.tsx";
import { Button } from "@/shared/ui/Button.tsx";

export function LoginPage(): JSX.Element {
  const [formValues, setFormValues] = useState({
    id: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleLogin = (e: React.FormEvent): void => {
    e.preventDefault();
  };

  return (
    <div className="grid min-h-screen grid-rows-[70px_minmax(200px,_1fr)]">
      <div className="row-start-1 row-end-2 flex">
        <Header />
      </div>
      <section className="flex flex-grow items-center justify-center">
        <div className="w-full max-w-md">
          <span className="text-xl font-bold">로그인</span>
          <form onSubmit={handleLogin}>
            <ul>
              <li className="mb-4">
                <input
                  type="text"
                  name="id"
                  value={formValues.id}
                  onChange={handleChange}
                  placeholder="아이디"
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </li>
              <li className="mb-4">
                <input
                  type="password"
                  name="password"
                  value={formValues.password}
                  onChange={handleChange}
                  placeholder="비밀번호"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </li>
            </ul>
            <span className="text-l">계정이 없으신가요?</span>
            <Link to="/signup">
              <span className="text-l text-blue-600"> 새로 만드세요.</span>
            </Link>
            <div className="mt-6 flex justify-center text-white">
              <Button variant="default" type="submit">
                로그인
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
