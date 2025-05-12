import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "@/components/layout/Header.tsx";
import { Button } from "@/shadcn/components/Button.tsx";
import { Layout } from "@/components/layout/Layout.tsx";
import { useGetFileByCode } from "@/services/file/useGetFileByCode.ts";

export function DownloadByCodePage(): JSX.Element {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { error } = useGetFileByCode(code);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setErrorMessage("");
    setCode(e.target.value);
  };

  const submitCode = (): void => {
    if (!code) {
      setErrorMessage("코드를 입력해주세요.");
      return;
    }
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    void navigate(`/c/${code}`);
  };

  return (
    <Layout header={<Header />}>
      <div className="flex flex-grow items-center justify-center">
        <section className="flex w-96 flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">다운로드</h2>
          <input
            type="text"
            value={code}
            onChange={handleInputChange}
            className="mb-1 mt-2 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-foreground"
            placeholder="Enter code"
          />
          <div className="flex w-full flex-col justify-center">
            <Button variant="default" type="button" onClick={submitCode}>
              확인
            </Button>
          </div>
          <div className="h-8">
            {errorMessage ?
              <p className="text-red-500">{errorMessage}</p>
            : null}
          </div>
        </section>
      </div>
    </Layout>
  );
}
