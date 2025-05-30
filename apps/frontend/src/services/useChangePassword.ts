import { useState } from "react";
import { userSchema } from "@cirrodrive/schemas/user";
import { toast } from "react-toastify";
import { trpc } from "#services/trpc.js";

export interface UseChangePasswordReturn {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
  changeError?: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangePassword: (e: React.FormEvent) => Promise<void>;
}

// 로그인된 사용자의 비밀번호 변경 훅
export const useChangePassword = (): UseChangePasswordReturn => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [changeError, setChangeError] = useState<string | undefined>(undefined);

  const changePasswordMutation = trpc.user.changePassword.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "currentPassword") setCurrentPassword(value);
    else if (name === "newPassword") setNewPassword(value);
    else if (name === "newPasswordConfirm") setNewPasswordConfirm(value);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(undefined);

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setChangeError("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setChangeError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    const passwordValidation = userSchema.shape.password.safeParse(newPassword);
    if (!passwordValidation.success) {
      setChangeError(
        passwordValidation.error.errors[0]?.message ??
          "비밀번호 유효성 검사에 실패했습니다.",
      );
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });

      toast.success("비밀번호가 성공적으로 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setChangeError(error.message);
      } else {
        setChangeError("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return {
    currentPassword,
    newPassword,
    newPasswordConfirm,
    changeError,
    handleInputChange,
    handleChangePassword,
  };
};
