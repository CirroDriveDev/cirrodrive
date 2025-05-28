import { useState } from "react";
import type { EntryDTO } from "@cirrodrive/schemas/entry";

export type TempFile = EntryDTO & {
  ownerName: string;
  currentPlanId: string;
};

export function useTempFileList(): {
  tempFiles: TempFile[];
  addTempFile: () => void;
  deleteTempFile: (id: string) => void; // ✅ 반환 타입에 추가
  isLoading: boolean;
} {
  const [tempFiles, setTempFiles] = useState<TempFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const randomSize = (): number => {
    const randomBytes = Math.random() * (10 * 1024 * 1024 - 1024) + 1024;
    return parseFloat(randomBytes.toFixed(2));
  };

  const randomOwner = (): { ownerName: string; currentPlanId: string } => {
    const owners = [
      { name: "Alice", plan: "free" },
      { name: "Bob", plan: "basic" },
      { name: "Charlie", plan: "premium" },
      { name: "Dave", plan: "basic" },
      { name: "Eve", plan: "free" },
    ];
    const picked = owners[Math.floor(Math.random() * owners.length)];
    return { ownerName: picked.name, currentPlanId: picked.plan };
  };

  const addTempFile = (): void => {
    setIsLoading(true);
    setTimeout(() => {
      const now = new Date();
      const { ownerName, currentPlanId } = randomOwner();
      const tempFile: TempFile = {
        id: Date.now().toString(),
        type: "file",
        name: `임시파일-${now.getTime()}.txt`,
        size: randomSize(),
        createdAt: now,
        updatedAt: now,
        trashedAt: null,
        parentFolderId: null,
        ownerName,
        currentPlanId,
      };
      setTempFiles((prev) => [...prev, tempFile]);
      setIsLoading(false);
    }, 500);
  };

  const deleteTempFile = (id: string): void => {
    setTempFiles((prev) => prev.filter((file) => file.id !== id));
  };

  return {
    tempFiles,
    addTempFile,
    deleteTempFile,
    isLoading,
  };
}
