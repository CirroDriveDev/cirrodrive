import { AdminFileView } from "#components/AdminFileView.js";

export function AdminFilePage(): JSX.Element {
  return (
    <div className="flex w-full flex-grow flex-col items-center">
      <div className="flex w-full items-center justify-between px-4 py-2 pt-8">
        <h1 className="text-2xl font-bold">파일 목록</h1>
        <div className="flex gap-2" />
      </div>
      <div className="flex w-full px-4">
        <AdminFileView />
      </div>
    </div>
  );
}
