import { useState } from "react";
import { useUserView } from "@/features/admin/userView/model.ts";
import { useUserAdd } from "@/features/admin/userAdd/model.ts";
import { useUserEdit } from "@/features/admin/userEdit/model.ts";

interface UseUserForm {
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

// 사용자 생성 및 수정 폼을 위한 커스텀 훅
export function useUserForm(userId?: number): UseUserForm {
  const { getUserById } = useUserView();
  const { addUser } = useUserAdd();
  const { updateUser } = useUserEdit();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  if (userId) {
    // 수정 모드일 때
    const user = getUserById(userId);
    if (user) {
      setUsername(user.username);
      setPassword(user.password);
      setEmail(user.email);
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (userId) {
      // 수정 모드
      updateUser(userId, { username, password, email });
    } else {
      // 생성 모드
      addUser({ username, password, email });
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    email,
    setEmail,
    handleSubmit,
  };
}
