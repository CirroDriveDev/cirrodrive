import { Search } from "lucide-react";
import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { useSearchBarStore } from "@/store/useSearchBarStore.ts";

export function SearchBar(): JSX.Element {
  const { searchTerm, setSearchTerm } = useSearchBarStore();
  const navigate = useNavigate();
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
      void navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`); // 검색어를 URL에 추가
    }
  };

  return (
    <div
      className={`h-10 max-w-96 flex-grow rounded-md bg-white text-black ${classList}`}
    >
      <label className="flex space-x-2 p-2">
        <Search />
        <input
          type="text"
          placeholder="검색"
          value={searchTerm}
          className="flex-grow bg-white focus:outline-none"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleInputChange} // 검색어 보내기
          onKeyDown={handleKeyDown} // Enter 키 처리
        />
      </label>
    </div>
  );
}
