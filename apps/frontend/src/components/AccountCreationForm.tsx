import { toast } from "react-toastify";
import { Button } from "#shadcn/components/Button.js";
import { FormInputField } from "#components/shared/FormInputField.js";
import { useAccountCreation } from "#services/useAccountCreation.js";

export function AccountCreationForm(): JSX.Element {
  const {
    email,
    verificationCode,
    timer,
    cooldown,
    isEmailVerified,
    sendError,
    verifyError,
    input,
    validationError,
    submissionError,
    handleInputChange,
    handleFormSubmit,
    handleCodeInputChange,
    handleSendCode,
    handleVerifyCode,
    mutation,
  } = useAccountCreation({
    onSuccess: () => {
      toast.success("계정 생성이 완료되었습니다.");
    },
    retry: 0,
  });

  const { username, password, confirmPassword, isAdmin, profileImageUrl } =
    input;

  return (
    <div className="flex flex-grow items-center justify-center">
      <section className="flex w-96 flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">계정 생성</h2>
        <form
          className="flex w-full flex-col items-center justify-center space-y-4"
          onSubmit={handleFormSubmit}
        >
          <FormInputField
            displayName="이름"
            type="text"
            name="username"
            value={username}
            onChange={handleInputChange}
            errorMessage={validationError?.username?._errors[0]}
          />
          <FormInputField
            displayName="이메일"
            type="email"
            name="email"
            value={email}
            onChange={handleCodeInputChange}
            errorMessage={validationError?.email?._errors[0] ?? sendError}
          />
          <div className="flex w-full items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSendCode}
              disabled={cooldown > 0 || mutation.status === "pending"}
            >
              {cooldown > 0 ? `다시 보내기 (${timer}s)` : "인증 코드 보내기"}
            </Button>
          </div>
          <FormInputField
            displayName="인증 코드"
            type="text"
            name="verificationCode"
            value={verificationCode}
            onChange={handleCodeInputChange}
            errorMessage={verifyError}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleVerifyCode}
            disabled={mutation.status === "pending"}
          >
            인증 확인
          </Button>

          {!isEmailVerified && (
            <p className="text-sm text-muted-foreground">
              이메일 인증 후에 계정을 생성할 수 있습니다.
            </p>
          )}

          {/* ✅ 프로필 이미지 URL 입력 추가 */}
          <FormInputField
            displayName="프로필 이미지 URL (선택)"
            type="text"
            name="profileImageUrl"
            value={profileImageUrl}
            onChange={handleInputChange}
            errorMessage={validationError?.profileImageUrl?._errors[0]}
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
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleInputChange}
            errorMessage={validationError?.confirmPassword?._errors[0]}
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAdmin"
              checked={isAdmin}
              onChange={handleInputChange}
              id="isAdmin"
            />
            <label htmlFor="isAdmin" className="ml-2">
              관리자 계정으로 생성
            </label>
          </div>

          {submissionError ?
            <div className="text-destructive">{submissionError}</div>
          : null}

          <Button
            type="submit"
            disabled={mutation.status === "pending"}
            className="w-full"
          >
            {mutation.status === "pending" ? "생성 중..." : "계정 생성"}
          </Button>
        </form>
      </section>
    </div>
  );
}
