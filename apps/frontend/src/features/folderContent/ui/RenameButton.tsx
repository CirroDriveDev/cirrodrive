import { Edit2 } from "lucide-react";
import { DropdownMenuItem } from "@/shared/components/shadcn/DropdownMenu.tsx";

interface RenameButtonProps {
  onRename: () => void;
  disabled: boolean;
}

export function RenameButton({
  onRename,
  disabled,
}: RenameButtonProps): JSX.Element {
  return (
    <DropdownMenuItem onClick={onRename} disabled={disabled}>
      <Edit2 />
      <span>이름 변경</span>
    </DropdownMenuItem>
  );
}
