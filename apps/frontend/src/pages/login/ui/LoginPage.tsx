import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { useLogin } from "@/pages/login/api/useLogin.ts";
import { FormInputField } from "@/shared/components/FormInputField.tsx";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { useUserStore } from "@/shared/store/useUserStore.ts";

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const {
    input,
    validationError,
    submissionError,
    handleInputChange,
    handleFormSubmit,
  } = useLogin({
    onSuccess: () => {
      navigate(`/folder/${user!.rootFolderId}`);
    },
    retry: 0,
  });
  const { username, password } = input;

  return (
    <Layout header={<Header />}>
      <div className="flex flex-grow items-center justify-center">
        <section className="flex w-96 flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">로그인</h2>
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
              type="password"
              name="password"
              value={password}
              onChange={handleInputChange}
              errorMessage={validationError?.password?._errors[0]}
            />

            {submissionError ?
              <div className="h-8">
                <p className="text-destructive">{submissionError}</p>
              </div>
            : null}

            <div className="flex w-full justify-center">
              <Button
                variant="default"
                className="w-full text-white"
                type="submit"
              >
                로그인
              </Button>
            </div>
            <div className="flex space-x-2">
              <span className="text-l">계정이 없으신가요?</span>
              <Link to="/register">
                <span className="text-l text-primary">회원가입</span>
              </Link>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
}
