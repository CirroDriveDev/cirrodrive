import { useNavigate, Link } from "react-router";
import { useRegister } from "#services/useRegister.js";
import { useEmailCode } from "#services/useEmailCode.js";
import { FormInputField } from "#components/shared/FormInputField.js";
import { Layout } from "#components/layout/Layout.js";
import { Header } from "#components/layout/Header.js";
import { Button } from "#shadcn/components/Button.js";

export function RegisterPage(): JSX.Element {
  const navigate = useNavigate();

  const {
    input,
    validationError,
    submissionError,
    handleInputChange,
    handleFormSubmit,
  } = useRegister({
    onSuccess: () => navigate("/login"),
  });

  const {
    email,
    verificationCode,
    handleCodeInputChange,
    handleSendCode,
    handleVerifyCode,
    timer,
    cooldown,
    isEmailVerified,
    sendError,
    verifyError,
  } = useEmailCode();

  const { username, password, passwordConfirm } = input;

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
              type="password"
              name="password"
              value={password}
              onChange={handleInputChange}
              errorMessage={validationError?.password?._errors[0]}
            />

            <FormInputField
              displayName="비밀번호 확인"
              type="password"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={handleInputChange}
              errorMessage={validationError?.passwordConfirm?._errors[0]}
            />

            {/* 이메일 입력 */}
            <FormInputField
              displayName="이메일"
              type="text"
              name="email"
              value={email}
              onChange={(e) => {
                handleInputChange(e);
                handleCodeInputChange(e);
              }}
              disabled={isEmailVerified}
            />
            <div className="flex w-full items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSendCode}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `${cooldown}초 후 재전송` : "인증 코드 보내기"}
              </Button>
              <span className="text-sm text-muted-foreground">
                유효 시간: {timer}초
              </span>
            </div>
            {sendError ?
              <p className="text-sm text-destructive">{sendError}</p>
            : null}

            {/* 인증 코드 입력 */}
            <FormInputField
              displayName="인증 코드"
              type="text"
              name="verificationCode"
              value={verificationCode}
              onChange={handleCodeInputChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleVerifyCode}
              disabled={isEmailVerified}
            >
              {isEmailVerified ? "이메일 인증 완료" : "인증 확인"}
            </Button>
            {verifyError ?
              <p className="text-sm text-destructive">{verifyError}</p>
            : null}

            {/* 서버 오류 메시지 */}
            {submissionError ?
              <div className="h-8">
                <p className="text-destructive">{submissionError}</p>
              </div>
            : null}

            {/* 회원가입 버튼 */}
            <Button
              type="submit"
              variant="default"
              className="mt-6 w-full"
              disabled={!isEmailVerified}
            >
              회원가입
            </Button>

            <div className="flex space-x-2">
              <span className="text-l">이미 계정이 있으신가요?</span>
              <Link to="/login">
                <span className="text-l text-primary">로그인</span>
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
    </Layout>
  );
}
