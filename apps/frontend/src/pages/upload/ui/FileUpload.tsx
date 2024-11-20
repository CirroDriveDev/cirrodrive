import { Header } from "@/shared/ui/layout/Header.tsx";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { useFileUpload } from "@/pages/upload/api/useFileupload.ts";
import { Button } from "@/shared/components/shadcn/Button.tsx";

export function FileUpload(): JSX.Element {
  const { handleFileSelect, uploadError, isPending } = useFileUpload(1);

  return (
    // TODO: 반응형 UI 구현
    <Layout header={<Header />}>
      <div>
        <Button
          onClick={handleFileSelect}
          disabled={isPending}
          style={{
            backgroundColor: isPending ? "gray" : "#4CAF50",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: isPending ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? "업로드 중..." : "파일 선택 및 업로드"}
        </Button>
        {uploadError ?
          <p style={{ color: "red", marginTop: "10px" }}>오류: {uploadError}</p>
        : null}
      </div>
    </Layout>
  );
}
