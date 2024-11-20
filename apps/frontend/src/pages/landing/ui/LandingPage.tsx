import { Link } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { LandingContainer } from "@/pages/landing/ui/LandingContainer.tsx";
import { Fileupload } from "@/pages/landing/ui/FileUploadImage.tsx";
import { Upload } from "@/pages/landing/ui/UploadImage.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";

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
            <Button className="mr-3">
              <Link to="/upload">업로드</Link>
            </Button>
            <Button>
              <Link to="/download">다운로드</Link>
            </Button>
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
            <Button className="mr-3">
              <Link to="/login">로그인</Link>
            </Button>
            <Button>
              <Link to="/signup">회원가입</Link>
            </Button>
          </div>
        </div>
      </div>
    </LandingContainer>
  );
}
