import { useState } from "react";
import { useUserView } from "#services/useUserView.js";
import { useUserAdd } from "#services/useUserAdd.js";
import { useUserEdit } from "#services/useUserEdit.js";

interface UserFormProps {
  userId?: string; // 수정 시 전달되는 기존 사용자
}

// 폼 컴포넌트
export function UserForm({ userId }: UserFormProps): JSX.Element {
  const {
    username,
    setUsername,
    password,
    setPassword,
    email,
    setEmail,
    handleSubmit,
  } = useUserForm(userId);

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
    >
      {/* 아이디 입력 */}
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="아이디"
        required
      />

      {/* 비밀번호 입력 - 수정 시에는 텍스트로 보여줌 */}
      <input
        type={password}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        required
      />

      {/* 이메일 입력 */}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
        required
      />

      {/* 제출 버튼 */}
      <button type="submit">{userId ? "수정하기" : "생성하기"}</button>
    </form>
  );
}

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
export function useUserForm(userId?: string): UseUserForm {
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
