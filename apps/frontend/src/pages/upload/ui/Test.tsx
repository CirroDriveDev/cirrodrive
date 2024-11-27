import { useState } from "react";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { useFolderManagement } from "@/entities/file/api/useFolderManagement.ts";

export function Test(): JSX.Element {
  const { folders, createFolder } = useFolderManagement();
  const [folderName, setFolderName] = useState("");

  const handleCreateFolder = (): void => {
    if (folderName) {
      createFolder(folderName);
      setFolderName("");
    }
  };

  return (
    <Layout header={<Header />}>
      <div style={{ padding: "20px" }}>
        <h2>폴더 관리</h2>
        <div>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="새 폴더 이름 입력"
            style={{
              padding: "10px",
              marginRight: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <Button onClick={handleCreateFolder} disabled={!folderName.trim()}>
            폴더 생성
          </Button>
        </div>

        <h3>폴더 목록</h3>
        <ul>
          {folders.map((folder) => (
            <li key={folder.id}>{folder.name}</li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
