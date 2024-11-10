import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { useRegister } from "@/pages/register/api/useRegister.ts";
import { FormInputField } from "@/shared/components/FormInputField.tsx";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";

export function RegisterPage(): JSX.Element {
  const navigate = useNavigate();
  const {
    input,
    validationError,
    submissionError,
    handleInputChange,
    handleFormSubmit,
  } = useRegister({
    onSuccess: () => {
      navigate("/login");
    },
  });
  const { username, password, passwordConfirm, email } = input;

  return (
    <Layout header={<Header />}>
      <div className="flex flex-grow items-center justify-center">
        <section className="flex w-96 flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">회원가입</h2>
          <form
            className="flex w-full flex-col items-center justify-center space-y-4"
            onSubmit={handleFormSubmit}
          >
            <FormInputField
              displayName="아이디"
              type="text"
              name="username"
              value={username}
              onChange={handleInputChange}
              errorMessage={validationError?.username?._errors[0]}
            />

            <FormInputField
              displayName="비밀번호"
              type="text"
              name="password"
              value={password}
              onChange={handleInputChange}
              errorMessage={validationError?.password?._errors[0]}
            />

            <FormInputField
              displayName="비밀번호 확인"
              type="text"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={handleInputChange}
              errorMessage={validationError?.passwordConfirm?._errors[0]}
            />

            <FormInputField
              displayName="이메일"
              type="text"
              name="email"
              value={email}
              onChange={handleInputChange}
              errorMessage={validationError?.email?._errors[0]}
            />

            {submissionError ?
              <div className="h-8">
                <p className="text-destructive">{submissionError}</p>
              </div>
            : null}
            <div className="flex w-full justify-center">
              <Button variant="default" className="w-full" type="submit">
                회원가입
              </Button>
            </div>
            <div className="flex space-x-2">
              <span className="text-l">이미 계정이 있으신가요?</span>
              <Link to="/login">
                <span className="text-l text-primary">로그인</span>
              </Link>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
}
