import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Header } from "@/widgets/WorkspaceLayout/ui/Header.tsx";
import { Button } from "@/shared/ui/Button.tsx";

export function DownloadPage(): JSX.Element {
  const [code, setCode] = useState<string>("");

  const baseUrl =
    "http://ec2-3-38-95-198.ap-northeast-2.compute.amazonaws.com:3000/api/v1";

  // 코드 입력 핸들러
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setCode(event.target.value);
  };

  // 파일 다운로드 핸들러
  const handleDownload = async (): Promise<void> => {
    console.log(code);
    if (!code) {
      return;
    }

    const response = await axios.get<Blob | MediaSource>(
      `${baseUrl}/files/download?code=${code}`,
      {
        responseType: "blob", // 파일 데이터 수신을 위한 설정
      },
    );

    const { fileName } = (await axios.get(`${baseUrl}/codes/${code}/metadata`)).data;

    // 파일 다운로드 처리
    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName; // 필요한 경우 파일명 설정
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

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
            name="code"
            placeholder="Code"
            onChange={handleInputChange}
            className="mb-1 mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <span className="text-l">코드가 없으신가요?</span>
          <Link to="/upload">
            <span className="text-l text-blue-600"> 새로운 코드 발급.</span>
          </Link>
          <div className="mt-6 flex justify-center">
            <Button
              variant="default"
              type="button"
              onClick={handleDownload}
            >
              OK
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
