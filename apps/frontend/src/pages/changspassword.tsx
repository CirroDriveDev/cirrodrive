import { FormInputField } from "#components/shared/FormInputField.js";
import { Button } from "#shadcn/components/Button.js";
import { useChangePassword } from "#services/useChangePassword.js";

// 비밀번호 변경 페이지 컴포넌트
export function ChangePasswordPage(): JSX.Element {
  const {
    currentPassword,
    newPassword,
    newPasswordConfirm,
    changeError,
    handleInputChange,
    handleChangePassword,
  } = useChangePassword();

  return (
    <div className="flex flex-grow items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border p-6 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">비밀번호 변경</h2>

        <form className="space-y-4" onSubmit={handleChangePassword}>
          <FormInputField
            displayName="현재 비밀번호"
            type="password"
            name="currentPassword"
            value={currentPassword}
            onChange={handleInputChange}
          />
          <FormInputField
            displayName="새 비밀번호"
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={handleInputChange}
          />
          <FormInputField
            displayName="새 비밀번호 확인"
            type="password"
            name="newPasswordConfirm"
            value={newPasswordConfirm}
            onChange={handleInputChange}
          />

          {changeError ?
            <p className="text-sm text-destructive">{changeError}</p>
          : null}

          <Button type="submit" variant="default" className="w-full">
            비밀번호 변경
          </Button>
        </form>
      </section>
    </div>
  );
}
