import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router";
import { Button } from "#shadcn/components/Button.js";
import { Input } from "#shadcn/components/Input.js";
import { Label } from "#shadcn/components/Label.js";
import { useLogin } from "#services/useLogin.js";

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ username: string; password: string }>();

  const { login, submissionError } = useLogin({
    onSuccess: (data) => {
      void navigate(`/folder/${data.rootFolderId}`);
    },
    retry: 0,
  });

  const onSubmit = async (data: { username: string; password: string }) => {
    await login(data);
  };

  return (
    <div className="flex flex-grow items-center justify-center">
      <section className="flex w-96 flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">로그인</h2>
        <form
          className="flex w-full flex-col items-center justify-center space-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="w-full">
            <Label htmlFor="username">아이디</Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              {...register("username", {
                required: "아이디를 입력하세요.",
              })}
              className={errors.username ? "border-destructive" : ""}
            />
            {typeof errors.username?.message === "string" && (
              <p className="text-destructive text-sm mt-1">
                {errors.username.message}
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
              <p className="text-destructive text-center">{submissionError}</p>
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
          <div className="flex flex-col items-center space-y-2 pt-2">
            <span className="text-sm">계정이 없으신가요?</span>
            <Link to="/register" className="text-primary underline">
              회원가입
            </Link>
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
  );
}
