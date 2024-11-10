import { File as FileIcon } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";

interface UploadResponse {
  fileId: number;
}

interface CodeResponse {
  code: string;
}

export function UploadPage(): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedCode, setUploadedCode] = useState<string | null>(null);

  const baseUrl =
    "http://ec2-3-38-95-198.ap-northeast-2.compute.amazonaws.com:3000/api/v1";

  async function uploadFile(file: File): Promise<number> {
    // FormData 생성
    const formData = new FormData();
    formData.append("file", file);

    try {
      // POST 요청 보내기
      const response = await axios.post<UploadResponse>(
        `${baseUrl}/files`,
        formData,
      );

      // 응답에서 fileId 추출
      const fileId: number = response.data.fileId;
      return fileId;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO: fix this
    } catch (error) {
      throw new Error("File upload failed");
    }
  }

  async function getCode(fileId: number): Promise<string> {
    try {
      const response = await axios.post<CodeResponse>(`${baseUrl}/codes`, {
        fileId,
      });
      const code: string = response.data.code;

      return code;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO: fix this
    } catch (error) {
      throw new Error("Failed to get code");
    }
  }

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    const fileId = await uploadFile(selectedFile);
    const code = await getCode(fileId);
    setUploadedCode(code);
  };

  return (
    // TODO: 반응형 UI 구현
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="w-full">
        <div className="mt-3 flex flex-row text-gray-300">
          <div className="ml-20 h-[30px] w-[100px] text-center align-middle">
            Name
          </div>
          <div className="ml-[500px] h-[30px] w-[100px] text-center align-middle">
            Size
          </div>
          <div className="ml-[200px] h-[30px] w-[100px] text-center align-middle">
            Actions
          </div>
        </div>
        <div className="flex h-[520px] items-center justify-center">
          <div className="bg-gray-50">
            <FileIcon size={60} color="gray" />
          </div>
        </div>
        <form
          method="post"
          encType="multipart/form-data"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises -- handleSubmit is a promise
          onSubmit={handleSubmit}
        >
          <div className="flex justify-between bg-gray-400">
            <div className="w-[90px] bg-gray-300">
              <Link to="/code" className="ms-6">
                코드
              </Link>
            </div>
            <div>{selectedFile?.name}</div>
            <div>{uploadedCode}</div>
            <button type="submit" className="w-[100px] bg-gray-300">
              업로드
            </button>
          </div>
          <div className="place-self-center">
            <input type="file" className="mt-20" onChange={handleFileChange} />
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}
