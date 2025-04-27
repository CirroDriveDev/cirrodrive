import { Link } from "react-router-dom";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { FormInputField } from "@/shared/components/FormInputField.tsx";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { useFindPassword } from "@/pages/find/api/useFindPassword.ts";

// 비밀번호 찾기 페이지 컴포넌트
export function FindPasswordPage(): JSX.Element {
  const {
    email,
    verificationCode,
    timer,
    cooldown,
    isEmailVerified,
    sendError,
    verifyError,
    submissionError,
    username,
    newPassword,
    newPasswordConfirm,
    handleCodeInputChange,
    handleSendCode,
    handleVerifyCode,
    handleInputChange,
    handleFindPassword,
  } = useFindPassword(); // 비밀번호 찾기 관련 상태와 메서드 가져오기

  return (
    <Layout header={<Header />}>
      {" "}
      {/* 레이아웃에 헤더 포함 */}
      <div className="flex flex-grow items-center justify-center">
        {" "}
        {/* 화면 중앙 정렬 */}
        <section className="flex w-96 flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">비밀번호 찾기</h2>

          <form
            className="flex w-full flex-col items-center justify-center space-y-4"
            onSubmit={handleFindPassword} // 비밀번호 찾기 제출 이벤트
          >
            {/* 아이디 입력 필드 */}
            <FormInputField
              displayName="아이디"
              type="text"
              name="username"
              value={username}
              onChange={handleInputChange}
            />

            {/* 이메일 입력 필드 (이메일 인증 완료 시 비활성화) */}
            <FormInputField
              displayName="이메일"
              type="text"
              name="email"
              value={email}
              onChange={handleCodeInputChange}
              disabled={isEmailVerified}
            />

            {/* 인증 코드 전송 버튼과 타이머 표시 */}
            <div className="flex w-full items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSendCode}
                disabled={cooldown > 0} // 쿨다운 중이면 비활성화
              >
                {cooldown > 0 ? `${cooldown}초 후 재전송` : "인증 코드 보내기"}
              </Button>
              <span className="text-sm text-muted-foreground">
                유효 시간: {timer}초
              </span>
            </div>

            {/* 인증 코드 전송 에러 표시 */}
            {sendError ?
              <p className="text-sm text-destructive">{sendError}</p>
            : null}

            {/* 인증 코드 입력 필드 */}
            <FormInputField
              displayName="인증 코드"
              type="text"
              name="verificationCode"
              value={verificationCode}
              onChange={handleCodeInputChange}
            />

            {/* 이메일 인증 확인 버튼 */}
            <Button
              type="button"
              variant="outline"
              onClick={handleVerifyCode}
              disabled={isEmailVerified} // 인증 완료 시 비활성화
            >
              {isEmailVerified ? "이메일 인증 완료" : "인증 확인"}
            </Button>

            {/* 인증 실패 에러 표시 */}
            {verifyError ?
              <p className="text-sm text-destructive">{verifyError}</p>
            : null}

            {/* 새 비밀번호 입력 필드 */}
            <FormInputField
              displayName="새 비밀번호"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={handleInputChange}
            />

            {/* 새 비밀번호 확인 입력 필드 */}
            <FormInputField
              displayName="새 비밀번호 확인"
              type="password"
              name="newPasswordConfirm"
              value={newPasswordConfirm}
              onChange={handleInputChange}
            />

            {/* 제출 에러 메시지 표시 */}
            {submissionError ?
              <p className="text-sm text-destructive">{submissionError}</p>
            : null}

            {/* 비밀번호 설정 버튼 */}
            <Button type="submit" variant="default" className="mt-6 w-full">
              설정하기
            </Button>
          </form>

          {/* 하단 링크 모음 (아이디 찾기 / 로그인 / 회원가입) */}
          <div className="flex space-x-2">
            <Link to="/findname">
              <span className="text-l text-primary">아이디 찾기</span>
            </Link>
            <div>/</div>
            <Link to="/login">
              <span className="text-l text-primary">로그인</span>
            </Link>
            <div>/</div>
            <Link to="/register">
              <span className="text-l text-primary">회원가입</span>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
