import { DefaultLayout } from "@/widgets/layout/ui/DefaultLayout.tsx";

export function SignupPage(): JSX.Element {
  return (
    <DefaultLayout>
      <section className="flex flex-grow items-center justify-center">
        <div>
          <form method="post" name="member_form">
            <h2 className="mb-6 text-2xl font-bold">회원 가입</h2>

            <div className="form-group mb-4">
              <div className="mb-2 flex items-center">
                <label className="w-1/4" id="username">
                  아이디
                  <input
                    className="flex-grow rounded-md border border-gray-300 px-3 py-2"
                    name="username"
                    type="text"
                  />
                </label>
                <button
                  className="ml-2 rounded border-gray-300 bg-gray-300 p-2"
                  type="button"
                >
                  Check ID
                </button>
              </div>
            </div>

            <div className="form-group mb-4">
              <div className="mb-2 flex items-center">
                <label className="w-1/4">
                  비밀번호
                  <input
                    className="flex-grow rounded-md border border-gray-300 px-3 py-2"
                    name="pass"
                    type="password"
                  />
                </label>
              </div>
            </div>

            <div className="form-group mb-4">
              <div className="mb-2 flex items-center">
                <label className="w-1/4">
                  비밀번호 확인
                  <input
                    className="flex-grow rounded-md border border-gray-300 px-3 py-2"
                    name="pass_confirm"
                    type="password"
                  />
                </label>
              </div>
            </div>

            <div className="form-group mb-4">
              <div className="mb-2 flex items-center">
                <label className="w-1/4">
                  이름
                  <input
                    className="flex-grow rounded-md border border-gray-300 px-3 py-2"
                    name="name"
                    type="text"
                  />
                </label>
              </div>
            </div>

            <div className="form-group mb-4">
              <div className="mb-2 flex items-center">
                <label className="w-1/4">
                  이메일
                  <input
                    className="rounded-md border border-gray-300 px-3 py-2"
                    name="email1"
                    type="text"
                  />
                </label>
                <span className="mx-2">@</span>
                <input
                  className="rounded-md border border-gray-300 px-3 py-2"
                  name="email2"
                  type="text"
                />
              </div>
            </div>

            <div className="my-6 border-t border-gray-300" />

            <div className="flex justify-center">
              <button
                className="mr-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                type="button"
              >
                Save
              </button>
              <button
                className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
                type="button"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </section>
    </DefaultLayout>
  );
}
