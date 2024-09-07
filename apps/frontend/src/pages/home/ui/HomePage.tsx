import { WorkspaceLayout } from "@/widgets/WorkspaceLayout/ui/WorkspaceLayout.tsx";

export function HomePage(): JSX.Element {
  return (
    <WorkspaceLayout>
      <div className="flex flex-grow items-center justify-center">
        <div>홈 페이지입니다.</div>
      </div>
    </WorkspaceLayout>
  );
}
