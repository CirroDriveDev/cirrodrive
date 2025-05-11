import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shadcn/components/Button.tsx";
import { FormInputField } from "@/components/shared/FormInputField.tsx";
import { Layout } from "@/components/layout/Layout.tsx";
import { Header } from "@/components/layout/Header.tsx";
import { useLogin } from "@/services/useLogin.ts";
//import { useUserStore } from "@/shared/store/useUserStore.ts";
//import { mockAdminUser } from "@/pages/admin/api/mockAdminUser.ts";

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  //const { setUser } = useUserStore();

  const {
    input,
    validationError,
    submissionError,
    handleInputChange,
    handleFormSubmit,
  } = useLogin({
    onSuccess: (data) => {
      // 로그인 성공 시 받은 user data 활용
      if (data.isAdmin) {
        navigate("/admin/user");
      } else {
        navigate(`/folder/${data.rootFolderId}`);
      }
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

            <div className="flex flex-col items-center space-y-2 pt-2">
              <span className="text-sm">계정이 없으신가요?</span>
              <Link to="/register" className="text-primary underline">
                회원가입
              </Link>

              {/* {import.meta.env.DEV ? <Button
                  onClick={() => {
                    setUser(mockAdminUser);
                    navigate("/admin/user");
                  }}
                  className="rounded bg-green-600 px-4 py-2 text-white"
                >
                  임시 관리자 로그인
                </Button> : null} */}
            </div>
            <div className="flex space-x-2">
              <Link to="/findname">
                <span className="text-l text-primary">아이디 찾기</span>
              </Link>
              <div>/</div>
              <Link to="/findpassword">
                <span className="text-l text-primary">비밀번호 찾기</span>
              </Link>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
}
