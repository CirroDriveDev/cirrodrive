import { useNavigate } from "react-router";
import { Button } from "#shadcn/components/Button.js";
import { useLogin } from "#services/useLogin.js";
import { FormInputField } from "#components/shared/FormInputField.js";
import { Layout } from "#components/layout/Layout.js";
import { Header } from "#components/layout/Header.js";

export function AdminLoginPage(): JSX.Element {
  const navigate = useNavigate();
  // const { input, handleInputChange, handleFormSubmit } = useLogin({
  const { handleInputChange, handleFormSubmit } = useLogin({
    onSuccess: () => {
      void navigate("/admin/user");
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
