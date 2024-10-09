import { Link } from "react-router-dom";
import { Header } from "@/widgets/WorkspaceLayout/ui/Header.tsx";
import { Button } from "@/shared/ui/Button.tsx";

export function DownloadPage(): JSX.Element {
  return (
    <div className="grid min-h-screen grid-rows-[70px_minmax(200px,_1fr)]">
      <div className="row-start-1 row-end-2 flex">
        <Header />
      </div>
      <section className="flex flex-grow items-center justify-center">
        <div className="w-full max-w-md">
          <span className="text-xl font-bold">코드를 입력하시오.</span>
          <input
            type="text"
            name="id"
            placeholder="Code"
            className="mb-1 mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <span className="text-l">코드가 없으신가요?</span>
          <Link to="/upload">
            <span className="text-l text-blue-600"> 새로운 코드 발급.</span>
          </Link>
          <div className="mt-6 flex justify-center">
            <Button variant="default" type="submit">
              OK
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
