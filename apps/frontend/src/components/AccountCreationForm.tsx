// AccountCreationForm.tsx
import { toast } from "react-toastify";
import { Button } from "#shadcn/components/Button.js";
import { FormInputField } from "#components/shared/FormInputField.js";
import { useAccountCreation } from "#services/useAccountCreation.js";

// AccountCreationForm.tsx
export function AccountCreationForm(): JSX.Element {
  const {
    input,
    validationError,
    submissionError,
    handleInputChange,
    handleFormSubmit,
    mutation,
  } = useAccountCreation({
    onSuccess: () => {
      toast.success("계정 생성이 완료되었습니다.");
    },
    retry: 0,
  });

  const {
    username,
    email,
    password,
    confirmPassword,
    isAdmin,
    profileImageUrl,
  } = input;

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
            onChange={handleInputChange}
            errorMessage={validationError?.email?._errors[0]}
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
          <FormInputField
            displayName="프로필 이미지 URL (선택)"
            type="text"
            name="profileImageUrl"
            value={profileImageUrl}
            onChange={handleInputChange}
            errorMessage={validationError?.profileImageUrl?._errors[0]}
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
