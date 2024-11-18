import { Link } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";

export function MyInfoModify(): JSX.Element {
  return (
    <Layout header={<Header />}>
      <div className="flex flex-grow items-center justify-center">
        <section className="flex w-96 flex-col items-center justify-center space-y-4">
          <h2 className="mb-11 text-4xl font-bold">내 정보</h2>
          <form className="flex w-full flex-col items-center justify-center space-y-4">
            <div className="flex space-x-3">
              <span className="text-2xl">아이디 : </span>
              <span className="text-2xl">abcd</span>
              <Link to="/upload">
                <Button variant="default" className="text-white">
                  편집
                </Button>
              </Link>
            </div>
            <div className="flex space-x-3">
              <span className="text-2xl">비밀번호 : </span>
              <span className="text-2xl">qwer1234!</span>
              <Link to="/upload">
                <Button variant="default" className="text-white">
                  편집
                </Button>
              </Link>
            </div>
            <div className="flex space-x-3">
              <span className="text-2xl">이메일 : </span>
              <span className="text-2xl">abcd@naver.com</span>
              <Link to="/upload">
                <Button variant="default" className="text-white">
                  편집
                </Button>
              </Link>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
}
