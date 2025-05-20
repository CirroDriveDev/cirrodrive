import { Link } from "react-router";
import { Layout } from "#components/layout/Layout.js";
import { Header } from "#components/layout/Header.js";
import { FormInputField } from "#components/shared/FormInputField.js";
import { Button } from "#shadcn/components/Button.js";
import { useFindUsername } from "#services/useFindUsername.js";

// 아이디 찾기 페이지 컴포넌트
export function FindUsernamePage(): JSX.Element {
  const {
    email,
    verificationCode,
    handleCodeInputChange,
    handleSendCode,
    handleVerifyCode,
    timer,
    cooldown,
    isEmailVerified,
    sendError,
    verifyError,
    submissionError,
    handleFindUsername,
  } = useFindUsername(); // 아이디 찾기 관련 상태와 메서드 가져오기

  return (
    <Layout header={<Header />}>
      {" "}
      {/* 헤더가 포함된 레이아웃 */}
      <div className="flex flex-grow items-center justify-center">
        {" "}
        {/* 중앙 정렬 컨테이너 */}
        <section className="flex w-96 flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">아이디 찾기</h2>

          <div className="flex w-full flex-col space-y-4">
            {/* 이메일 입력 필드 (이메일 인증 완료 시 비활성화) */}
            <FormInputField
              displayName="이메일"
              type="text"
              name="email"
              value={email}
              onChange={handleCodeInputChange}
              disabled={isEmailVerified}
            />

            {/* 인증 코드 보내기 버튼 + 타이머 */}
            <div className="flex w-full items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSendCode}
                disabled={cooldown > 0} // 쿨다운 시간 동안 비활성화
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

            {/* 최종 제출 에러 표시 */}
            {submissionError ?
              <p className="text-sm text-destructive">{submissionError}</p>
            : null}

            {/* 아이디 조회 버튼 (이메일 인증 완료해야 활성화) */}
            <Button
              type="button"
              variant="default"
              onClick={handleFindUsername}
              disabled={!isEmailVerified}
            >
              아이디 조회하기
            </Button>
          </div>

          {/* 하단 링크 모음 (비밀번호 찾기 / 로그인 / 회원가입) */}
          <div className="flex space-x-2">
            <Link to="/findpassword">
              <span className="text-l text-primary">비밀번호 찾기</span>
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
