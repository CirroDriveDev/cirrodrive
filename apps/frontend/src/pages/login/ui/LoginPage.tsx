import { DefaultLayout } from "@/widgets/layout/ui/DefaultLayout.tsx";

export function LoginPage(): JSX.Element {
  return (
    <DefaultLayout>
      <section className="flex flex-grow items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <span className="text-xl font-bold">로그인</span>
          </div>
          <form action="login.php" method="post" name="login_form">
            <ul>
              <li className="mb-4">
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  name="id"
                  placeholder="아이디"
                  type="text"
                />
              </li>
              <li className="mb-4">
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  name="pass"
                  placeholder="비밀번호"
                  type="password"
                />
              </li>
            </ul>
            <div className="mt-6 flex justify-center">
              <button
                className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                type="button"
              >
                로그인
              </button>
            </div>
          </form>
        </div>
      </section>
    </DefaultLayout>
  );
}
