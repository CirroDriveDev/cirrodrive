import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Button } from "#shadcn/components/Button.js";
import { Input } from "#shadcn/components/Input.js";
import { Label } from "#shadcn/components/Label.js";
import { Layout } from "#components/layout/Layout.js";
import { Header } from "#components/layout/Header.js";
import { useAdminLogin } from "#services/admin/useAdminLogin.js";

export function AdminLoginPage(): JSX.Element {
  const navigate = useNavigate();
  // React Hook Form 사용, 이메일/비밀번호 필드 및 에러 관리
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string; password: string }>();

  // useAdminLogin 훅에서 login 함수와 서버 에러 상태만 사용
  const { login, submissionError } = useAdminLogin({
    onSuccess: () => {
      void navigate("/admin/user");
    },
    retry: 0,
  });

  // 폼 제출 핸들러: 서버 요청 에러는 useAdminLogin에서 관리
  const onSubmit = async (data: { email: string; password: string }) => {
    await login(data);
  };

  return (
    <Layout header={<Header />}>
      <div className="flex flex-grow items-center justify-center">
        <section className="flex w-96 flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">관리자 로그인</h2>
          <form
            className="flex w-full flex-col items-center justify-center space-y-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="w-full">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                {...register("email", {
                  required: "이메일을 입력하세요.",
                })}
                className={errors.email ? "border-destructive" : ""}
              />
              {typeof errors.email?.message === "string" && (
                <p className="text-destructive text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password", {
                  required: "비밀번호를 입력하세요.",
                  minLength: {
                    value: 8,
                    message: "비밀번호는 8자 이상이어야 합니다.",
                  },
                })}
                className={errors.password ? "border-destructive" : ""}
              />
              {typeof errors.password?.message === "string" && (
                <p className="text-destructive text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            {submissionError ?
              <div className="h-8 w-full">
                <p className="text-destructive text-center">
                  {submissionError}
                </p>
              </div>
            : null}
            <div className="flex w-full justify-center">
              <Button
                variant="default"
                className="w-full text-white"
                type="submit"
                disabled={isSubmitting}
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
