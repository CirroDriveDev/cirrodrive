import { FolderIcon, MoreVertical } from "lucide-react";
import { useState } from "react";
import { ClickButton } from "@/shared/components/shadcn/ClickButton.tsx";

interface TreeNode {
  id: number;
  name: string;
  children?: TreeNode[];
  size?: number;
  level?: number; // level 속성을 선택적(optional)으로 변경
}

export function TreeNode({
  node,
  level = 0,
}: {
  node: TreeNode;
  level: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div>
      <div style={{ marginLeft: level * 50 }} className="">
        <div className="flex h-20 w-[1400px] justify-between bg-slate-500">
          <ClickButton onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex flex-row items-center">
              <div>
                <FolderIcon size={60} />
              </div>
              <div>이름 :{node.name}</div>
              <div>사이즈 : {node.size}</div>
              <div>
                <MoreVertical />
              </div>
            </div>
          </ClickButton>
        </div>
      </div>

      {isExpanded && node.children ?
        <div className="">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      : null}
    </div>
  );
}
