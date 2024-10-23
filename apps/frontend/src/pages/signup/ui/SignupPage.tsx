import React, { useState } from "react";
import { Header } from "@/widgets/WorkspaceLayout/ui/Header.tsx";
import { Button } from "@/shared/ui/Button.tsx";

export function SignupPage(): JSX.Element {
 
  const [formValues, setFormValues] = useState({
    id: "",
    password: "",
    passwordConfirm: "",
    name: "",
    email1: "",
    email2: "",
  });

  const [message, setMessage] = useState("");


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };


  const handleReset = () => {
    setFormValues({
      id: "",
      password: "",
      passwordConfirm: "",
      name: "",
      email1: "",
      email2: "",
    });
    setMessage(""); 
  };

  const handleSignup = () => {
    const { id, password, passwordConfirm, name, email1, email2 } = formValues;

    if (!id || !password || !passwordConfirm || !name || !email1 || !email2) {
      setMessage("모든 항목을 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    const userData = {
      id,
      password,
      name,
      email: `${email1}@${email2}`,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    setMessage("회원가입이 성공적으로 완료되었습니다!");
    alert("회원가입이 성공적으로 완료되었습니다!");

    handleReset();
  };


  return (
    <div className="grid min-h-screen grid-rows-[70px_minmax(200px,_1fr)]">
      <div className="row-start-1 row-end-2 flex">
        <Header />
      </div>
      <section className="flex flex-grow items-center justify-center">
        <div>
          <h2 className="mb-6 text-2xl font-bold">회원 가입</h2>

          <div className="form-group mb-4">
            <div className="mb-2 flex items-center">
              <label className="w-1/4">아이디</label>
              <input
                type="text"
                name="id"
                value={formValues.id}
                onChange={handleChange}
                className="flex-grow rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <div className="mb-2 flex items-center">
              <label className="w-1/4">비밀번호</label>
              <input
                type="password"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                className="flex-grow rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <div className="mb-2 flex items-center">
              <label className="w-1/4">비밀번호 확인</label>
              <input
                type="password"
                name="passwordConfirm"
                value={formValues.passwordConfirm}
                onChange={handleChange}
                className="flex-grow rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <div className="mb-2 flex items-center">
              <label className="w-1/4">이름</label>
              <input
                type="text"
                name="name"
                value={formValues.name}
                onChange={handleChange}
                className="flex-grow rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <div className="mb-2 flex items-center">
              <label className="mr-2 w-3/4">이메일</label>
              <input
                type="text"
                name="email1"
                value={formValues.email1}
                onChange={handleChange}
                className="rounded-md border border-gray-300 px-3 py-2"
              />
              <span className="mx-2">@</span>
              <input
                type="text"
                name="email2"
                value={formValues.email2}
                onChange={handleChange}
                className="rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="my-6 border-t border-gray-300" />

          <div className="mb-4 text-center text-red-500">
            {message ?
              <p>{message}</p>
            : null}
          </div>

          <div className="flex justify-center">
            <Button variant="default" className="mr-4" onClick={handleSignup}>
              저장
            </Button>
            <Button
              variant="outline"
              className="bg-gray-500 px-4 py-2 font-bold text-white"
              onClick={handleReset}
            >
              초기화
            </Button>

          </div>
        </div>
      </section>
    </div>
  );
}
