import { Search } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/shared/components/ThemeProvider.tsx";

export function SearchBar(): JSX.Element {
  const { theme } = useTheme();
  const foregroundColor = theme === "light" ? "black" : "white";
  const outlineClassList = `outline outline-1 outline-ring hover:outline-foreground`;
  const [classList, setClassList] = useState<string>(outlineClassList);

  const handleFocus = (): void => {
    setClassList("outline-none");
  };

  const handleBlur = (): void => {
    setClassList(outlineClassList);
  };

  return (
    <div
      className={`h-10 max-w-96 flex-grow rounded-md bg-background ${classList}`}
    >
      <label className="flex space-x-2 p-2">
        <Search color={foregroundColor} />
        <input
          type="text"
          placeholder="검색"
          className="flex-grow bg-background text-foreground focus:outline-none"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </label>
    </div>
  );
}
