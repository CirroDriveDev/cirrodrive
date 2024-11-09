import axios from "axios";
import { useState } from "react";
import { WorkspaceLayout } from "@/widgets/WorkspaceLayout/ui/WorkspaceLayout.tsx";
import { Button } from "@/shared/ui/Button.tsx";
import Modal from "@/pages/upload/Modal";
import Popup from "@/pages/upload/ui/Popup";

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
    <WorkspaceLayout>
      <div className="w-full">
        <form
          method="post"
          encType="multipart/form-data"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises -- handleSubmit is a promise
          onSubmit={handleSubmit}
        >
          <div className="flex h-[400px] justify-center">
            <input
              type="file"
              className="place-self-end"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex h-[150px] items-end">
            <div className="ml-60 mr-[300px]">
              <select className="ml-40 h-[40px] w-[100px] rounded-lg bg-blue-50 text-center font-bold shadow-xl">
                <option value="1">1일</option>
                <option value="2">2일</option>
                <option value="3">3일</option>
                <option value="4">4일</option>
                <option value="5">5일</option>
                <option value="6">6일</option>
                <option value="7">7일</option>
              </select>
            </div>
            <Button type="submit" className="shadow-xl">
              <Popup />
            </Button>
          </div>

          <div className="">
            <div>파일 이름: {selectedFile?.name}</div>
            <div>코드 : {uploadedCode}</div>
            <div>유효 기간 : </div>
            <Modal />
          </div>
        </form>
      </div>
    </WorkspaceLayout>
  );
}
