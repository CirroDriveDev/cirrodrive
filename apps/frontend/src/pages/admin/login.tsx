import { useNavigate } from "react-router"; // React Router를 사용하여 페이지 이동을 처리
import { Button } from "#shadcn/components/Button.js"; // 버튼 컴포넌트
import { FormInputField } from "#components/shared/FormInputField.js"; // 폼 입력 필드 컴포넌트
import { Layout } from "#components/layout/Layout.js"; // 페이지 레이아웃 컴포넌트
import { Header } from "#components/layout/Header.js"; // 헤더 컴포넌트
import { useAdminLogin } from "#services/useAdminLogin.js";

export function AdminLoginPage(): JSX.Element {
  const navigate = useNavigate(); // 페이지 이동을 위한 React Router 훅

  const {
    input, // 폼 입력값 상태
    validationError, // 유효성 검사 오류 상태
    submissionError, // 서버 요청 오류 상태
    handleInputChange, // 입력값 변경 핸들러
    handleFormSubmit, // 폼 제출 핸들러
  } = useAdminLogin({
    onSuccess: () => {
      // 로그인 성공 시 호출되는 콜백
      void navigate("/admin/file"); // 관리자 파일 페이지로 이동
    },
    retry: 0, // 요청 실패 시 재시도 횟수 설정
  });

  const { email, password } = input; // 입력값 상태에서 이메일과 비밀번호 추출

  return (
    <Layout header={<Header />}>
      {" "}
      {/* 페이지 레이아웃 */}
      <div className="flex flex-grow items-center justify-center">
        {" "}
        {/* 중앙 정렬 */}
        <section className="flex w-96 flex-col items-center justify-center space-y-4">
          {" "}
          {/* 로그인 섹션 */}
          <h2 className="text-2xl font-bold">관리자 로그인</h2> {/* 제목 */}
          <form
            className="flex w-full flex-col items-center justify-center space-y-4" // 폼 스타일
            onSubmit={handleFormSubmit} // 폼 제출 핸들러 연결
          >
            <FormInputField
              displayName="이메일" // 필드 라벨
              type="email" // 입력 타입
              name="email" // 입력 필드 이름
              value={email} // 입력값 상태 연결
              onChange={handleInputChange} // 입력값 변경 핸들러 연결
              errorMessage={validationError?.email?._errors[0]} // 유효성 검사 오류 메시지
            />
            <FormInputField
              displayName="비밀번호" // 필드 라벨
              type="password" // 입력 타입
              name="password" // 입력 필드 이름
              value={password} // 입력값 상태 연결
              onChange={handleInputChange} // 입력값 변경 핸들러 연결
              errorMessage={validationError?.password?._errors[0]} // 유효성 검사 오류 메시지
            />

            {(
              submissionError // 서버 요청 오류 메시지 표시
            ) ?
              <div className="h-8">
                <p className="text-destructive">{submissionError}</p>
              </div>
            : null}

            <div className="flex w-full justify-center">
              {" "}
              {/* 버튼 컨테이너 */}
              <Button
                variant="default" // 버튼 스타일
                className="w-full text-white" // 버튼 스타일
                type="submit" // 버튼 타입
              >
                로그인
              </Button>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
}
