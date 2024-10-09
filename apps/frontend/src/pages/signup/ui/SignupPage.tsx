import { Header } from "@/widgets/WorkspaceLayout/ui/Header.tsx";
import { Button } from "@/shared/ui/Button.tsx";

export function SignupPage(): JSX.Element {
  return (
    <div className="grid min-h-screen grid-rows-[70px_minmax(200px,_1fr)]">
      <div className="row-start-1 row-end-2 flex">
        <Header />
      </div>
      <section className="flex flex-grow items-center justify-center">
        <div>
          <h2 className="mb-6 text-2xl font-bold">회원 가입</h2>

          <div className="form-group mb-4">
            <div className="mb-2 flex items-center">
              <label className="w-1/4">아이디</label>
              <input
                type="text"
                name="id"
                className="flex-grow rounded-md border border-gray-300 px-3 py-2"
              />
              <Button
                variant="outline"
                className="bg-muted ml-2 rounded border-gray-300 p-2"
              >
                Check ID
              </Button>
            </div>
          </div>

          <div className="form-group mb-4">
            <div className="mb-2 flex items-center">
              <label className="w-1/4">비밀번호</label>
              <input
                type="password"
                name="pass"
                className="flex-grow rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <div className="mb-2 flex items-center">
              <label className="w-1/4">비밀번호 확인</label>
              <input
                type="password"
                name="pass_confirm"
                className="flex-grow rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <div className="mb-2 flex items-center">
              <label className="w-1/4">이름</label>
              <input
                type="text"
                name="name"
                className="flex-grow rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <div className="mb-2 flex items-center">
              <label className="mr-2 w-3/4">이메일</label>
              <input
                type="text"
                name="email1"
                className="rounded-md border border-gray-300 px-3 py-2"
              />
              <span className="mx-2">@</span>
              <input
                type="text"
                name="email2"
                className="rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="my-6 border-t border-gray-300" />

          <div className="flex justify-center">
            <Button variant="default" className="mr-4 text-white">
              저장
            </Button>
            <Button
              variant="outline"
              className="bg-gray-500 px-4 py-2 font-bold text-white"
            >
              초기화
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
