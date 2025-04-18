/* eslint-disable unicorn/filename-case -- Todo */
import { useUserForm } from "@/widgets/adminUserForm/model.ts";

interface UserFormProps {
  userId?: number; // 수정 시 전달되는 기존 사용자
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
