import { Link } from "react-router";
import { Button } from "#shadcn/components/Button.js";
import { LandingContainer } from "#components/layout/LandingContainer.js";
import { Fileupload } from "#components/FileUploadImage.js";
import { Upload } from "#components/UploadImage.js";
import { Header } from "#components/layout/Header.js";

export function LandingPage(): JSX.Element {
  return (
    <LandingContainer header={<Header />}>
      <div className="flex flex-col items-end justify-center">
        <div className="flex flex-col justify-center">
          <div className="mb-4 text-6xl font-semibold">비회원 파일 전송</div>
          <div className="mb-5 text-3xl">쉽고, 빠르고, 안전하게</div>
          <div className="mb-5">
            파일을 올리면 짧은 코드를 제공받고 코드를 입력하면 파일 다운로드가
            가능한 방식을 통해 비회원 파일전송이 가능합니다.
          </div>
          <div className="flex w-4/12 flex-row justify-evenly">
            <Link to="/upload">
              <Button className="mr-3">업로드</Button>
            </Link>
            <Link to="/download">
              <Button>다운로드</Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Upload />
      </div>
      <div className="flex flex-col items-center justify-center">
        <Fileupload />
      </div>
      <div className="flex flex-col items-start justify-center">
        <div className="">
          <div className="mb-4 text-6xl font-semibold">로그인 백업, 공유</div>
          <div className="mb-5 text-3xl">편하고, 프라이빗한</div>
          <div className="mb-5">
            웹사이트에서 클라우드 파일을 편하게 백업, 공유해 보세요. 로그인을
            통해 좀더 프라이빗하게 파일을 관리할 수 있습니다.
          </div>
          <div className="flex w-4/12 flex-row justify-evenly">
            <Link to="/login">
              <Button className="mr-3">로그인</Button>
            </Link>
            <Link to="/register">
              <Button>회원가입</Button>
            </Link>
          </div>
        </div>
      </div>
    </LandingContainer>
  );
}
