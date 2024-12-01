import { Search } from "lucide-react";
import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/shared/components/shadcn/ThemeProvider.tsx";
import { useSearchBarStore } from "@/shared/store/useSearchBarStore.ts";

export function SearchBar(): JSX.Element {
  const { theme } = useTheme();
  const { searchTerm, setSearchTerm } = useSearchBarStore();
  const navigate = useNavigate();
  const foregroundColor = theme === "light" ? "black" : "white";
  const outlineClassList =
    "outline outline-1 outline-ring hover:outline-foreground";
  const [classList, setClassList] = useState<string>(outlineClassList);

  const handleFocus = (): void => {
    setClassList("outline-none");
  };

  const handleBlur = (): void => {
    setClassList(outlineClassList);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value); // 받은 입력값을 부모에게 전달
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter" && searchTerm.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`); // 검색어를 URL에 추가
    }
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
          value={searchTerm}
          className="flex-grow bg-background text-foreground focus:outline-none"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleInputChange} // 검색어 보내기
          onKeyDown={handleKeyDown} // Enter 키 처리
        />
      </label>
    </div>
  );
}
