import { Header } from "@/shared/ui/layout/Header.tsx";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { useUpload } from "@/pages/upload/api/useUpload.ts";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { Button } from "@/shared/components/shadcn/Button.tsx";

export function UploadPage(): JSX.Element {
  const { selectedFile, code, mutation, handleFileChange, handleFormSubmit } =
    useUpload();

  return (
    // TODO: 반응형 UI 구현
    <Layout header={<Header />}>
      <Sidebar />
      <div className="w-full">
        <form method="post" onSubmit={handleFormSubmit}>
          <div className="h-96 place-content-end">
            <div className="place-self-center">
              <input
                type="file"
                name="file"
                className="mt-20"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="mt-24 flex justify-between">
            <select className="ml-[400px] h-[40px] w-[100px] rounded-lg bg-blue-50 text-center font-bold shadow-xl">
              <option className="text-gray-400" value="1">
                1일
              </option>
              <option className="text-gray-400" value="2">
                2일
              </option>
              <option className="text-gray-400" value="3">
                3일
              </option>
              <option className="text-gray-400" value="4">
                4일
              </option>
              <option className="text-gray-400" value="5">
                5일
              </option>
              <option className="text-gray-400" value="6">
                6일
              </option>
              <option className="text-gray-400" value="7">
                7일
              </option>
            </select>

            <Button
              type="submit"
              className="mr-[500px] h-10 w-[80px] rounded-lg bg-blue-600 font-bold text-white shadow-xl"
            >
              업로드
            </Button>
          </div>

          <div className="">
            <div>파일이름 :{selectedFile?.name}</div>
            {code ?
              <>코드: {code}</>
            : null}
          </div>
          <div className="flex h-8 w-full justify-center">
            {mutation.isPending ?
              <LoadingSpinner />
            : null}
          </div>
          {mutation.error ?
            <div className="h-8">
              <p className="text-red-500">오류 :{mutation.error.message}</p>
            </div>
          : null}
        </form>
      </div>
    </Layout>
  );
}
