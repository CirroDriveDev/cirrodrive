import { File } from "lucide-react";
import { WorkspaceLayout } from "@/widgets/WorkspaceLayout/ui/WorkspaceLayout.tsx";

export function UploadPage(): JSX.Element {
  return (
    <WorkspaceLayout>
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
            <File size={60} color="gray" />
          </div>
        </div>
        <form action="#" method="post" encType="multipart/form-data">
          <div className="relative flex flex-row bg-gray-400">
            <span className="absolute right-0 top-0">
              <button type="submit" className="w-[100px] bg-gray-300">
                업로드
              </button>
            </span>
            <div className="w-[90px] bg-gray-300">
              <button type="button" className="ms-6">
                내 PC
              </button>
            </div>
          </div>
          <div className="place-self-center">
            <input type="file" name="#" className="mt-20" />
          </div>
        </form>
      </div>
    </WorkspaceLayout>
  );
}
