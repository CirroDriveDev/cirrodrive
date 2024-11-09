import { useState } from "react";
import { ChevronDown, ChevronUp, FolderClosed } from "lucide-react";
import { Button } from "@/shared/ui/Button.tsx";

export function CollapsibleButton({
  icon,
  text,
}: {
  icon: JSX.Element;
  text: string;
}): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <Button
        variant="ghost"
        className="flex flex-grow items-center justify-between"
        onClick={handleClick}
      >
        <div className="flex items-center">
          <div className="mr-[10px]">{icon}</div>
          <div>{text}</div>
        </div>
        <div className="flex items-center">
          {isOpen ?
            <ChevronUp />
          : <ChevronDown />}
        </div>
      </Button>
      {isOpen ?
        <Button variant="ghost" className="flex items-center">
          <FolderClosed className="mr-[10px]" />
          폴더1
        </Button>
      : null}
    </div>
  );
}
