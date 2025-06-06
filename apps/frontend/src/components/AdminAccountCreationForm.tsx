import { Button } from "#shadcn/components/Button.js";
import { FormInputField } from "#components/shared/FormInputField.js";
import { useAdminAccountCreation } from "#services/admin/useAdminAccountCreation.js";

interface AdminAccountCreationFormProps {
  // 관리자 계정 생성이 완료되면 호출되어, 예를 들어 다이얼로그 닫기 등 후속 처리를 진행할 수 있습니다.
  onSubmit?: () => void;
}

export function AdminAccountCreationForm({
  onSubmit,
}: AdminAccountCreationFormProps): JSX.Element {
  const {
    input,
    validationError,
    submissionError,
    handleInputChange,
    handleFormSubmit,
    mutation,
  } = useAdminAccountCreation({}, onSubmit);

  const { username, email, password, confirmPassword } = input;

  return (
    <div className="flex flex-grow items-center justify-center">
      <section className="flex w-96 flex-col items-center justify-center space-y-4">
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
