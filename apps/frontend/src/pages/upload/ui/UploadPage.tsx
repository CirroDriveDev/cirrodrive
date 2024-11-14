import { File as FileIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { useUpload } from "@/pages/upload/api/useUpload.ts";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";

export function UploadPage(): JSX.Element {
  const { selectedFile, code, mutation, handleFileChange, handleFormSubmit } =
    useUpload();

  return (
    // TODO: 반응형 UI 구현
    <Layout header={<Header />}>
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
        <form method="post" onSubmit={handleFormSubmit}>
          <div className="flex justify-between bg-gray-400">
            <div className="w-[90px] bg-gray-300">
              <Link to="/code" className="ms-6">
                코드
              </Link>
            </div>
            <div>{selectedFile?.name}</div>
            <button type="submit" className="w-[100px] bg-gray-300">
              업로드
            </button>
          </div>
          <div className="flex justify-center">
            {code ?
              <>코드: {code}</>
            : null}
          </div>
          <div className="mt-4 flex h-8 w-full justify-center">
            {mutation.isPending ?
              <LoadingSpinner />
            : null}
          </div>
          {mutation.error ?
            <div className="h-8">
              <p className="text-red-500">{mutation.error.message}</p>
            </div>
          : null}
          <div className="place-self-center">
            <input
              type="file"
              name="file"
              className="mt-20"
              onChange={handleFileChange}
            />
          </div>
        </form>
      </div>
    </Layout>
  );
}
