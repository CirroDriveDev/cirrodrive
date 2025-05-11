import { useNavigate } from "react-router-dom";
import { Button } from "@/shadcn/components/Button.tsx";
import { useLogin } from "@/pages/login/api/useLogin.ts";
import { FormInputField } from "@/components/shared/FormInputField.tsx";
import { Layout } from "@/components/layout/Layout.tsx";
import { Header } from "@/components/layout/Header.tsx";

export function AdminLoginPage(): JSX.Element {
  const navigate = useNavigate();
  // const { input, handleInputChange, handleFormSubmit } = useLogin({
  const { handleInputChange, handleFormSubmit } = useLogin({
    onSuccess: () => {
      navigate("/admin/user");
    },
    retry: 0,
  });

  // const { email, password } = input; 나중에 주석 제거

  return (
    <Layout header={<Header />}>
      <div className="flex flex-grow items-center justify-center">
        <section className="flex w-96 flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">관리자 로그인</h2>
          <form
            className="flex w-full flex-col items-center justify-center space-y-4"
            onSubmit={handleFormSubmit}
          >
            <FormInputField
              displayName="이메일"
              type="email"
              name="email"
              // value={email}
              onChange={handleInputChange}
            />
            <FormInputField
              displayName="비밀번호"
              type="password"
              name="password"
              // value={password}
              onChange={handleInputChange}
            />
            <div className="flex w-full justify-center">
              <Button
                variant="default"
                className="w-full text-white"
                type="submit"
              >
                로그인
              </Button>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
}
