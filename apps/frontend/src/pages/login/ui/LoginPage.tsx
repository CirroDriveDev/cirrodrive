import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/widgets/WorkspaceLayout/ui/Header.tsx";
import { Button } from "@/shared/ui/Button.tsx";

export function LoginPage(): JSX.Element {
 
  const [formValues, setFormValues] = useState({
    id: "",
    password: "",
  });
  const [message, setMessage] = useState(""); 

  const navigate = useNavigate(); 


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();


    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const { id, password } = JSON.parse(storedUser);

  
      if (formValues.id === id && formValues.password === password) {
        setMessage("로그인 성공!");
        navigate("/Home");
      } else {
        setMessage("아이디 또는 비밀번호가 일치하지 않습니다.");
      }
    } else {
      setMessage("가입된 사용자가 없습니다. 회원가입을 진행해주세요.");
    }
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
            {message && (
              <p className="mb-4 text-center text-red-500">{message}</p>
            )}
            <span className="text-l">계정이 없으신가요?</span>
            <Link to="/signup">
              <span className="text-l text-blue-600"> 새로 만드세요.</span>
            </Link>
            <div className="mt-6 flex justify-center">
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
