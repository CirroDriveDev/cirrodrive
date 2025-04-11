import { useState, useEffect } from "react";
import { type User } from "@/entities/user/types.ts";

// props 정의
interface UserFormProps {
  initialUser?: User; // 수정 시 전달되는 기존 사용자
  onSubmit: (user: Omit<User, "id">) => void; // 폼 제출 콜백
  isEdit?: boolean; // 수정 모드 여부
}

// 폼 컴포넌트
export function UserForm({
  initialUser,
  onSubmit,
  isEdit = false,
}: UserFormProps): JSX.Element {
  // 입력 필드 상태
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  // 수정 모드일 때 초기 값 세팅
  useEffect(() => {
    if (initialUser) {
      setUsername(initialUser.username);
      setPassword(initialUser.password);
      setEmail(initialUser.email);
    }
  }, [initialUser]);

  // 제출 처리
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit({ username, password, email });
  };

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
      <button type="submit">{isEdit ? "수정하기" : "생성하기"}</button>
    </form>
  );
}
