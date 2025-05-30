import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  useFileSearchBarStore,
  type EntryType,
} from "#store/useFileSearchBarStore.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "#shadcn/components/DropdownMenu.js";
import { Button } from "#shadcn/components/Button.js";

export function FileSearchBar(): JSX.Element {
  const { setFilter, resetFilters } = useFileSearchBarStore();
  const [inputValue, setInputValue] = useState<string>("");

  const [activeFields, setActiveFields] = useState<{
    name: boolean;
    updatedAt: boolean;
    minSizeMB: boolean;
    maxSizeMB: boolean;
  }>({
    name: true,
    updatedAt: false,
    minSizeMB: false,
    maxSizeMB: false,
  });

  const toggleField = (field: keyof typeof activeFields) => {
    setActiveFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (activeFields.name) setFilter("name", value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as EntryType;
    setFilter("type", selected);
  };

  const resetAll = () => {
    setInputValue("");
    resetFilters();
    setActiveFields({
      name: true,
      updatedAt: false,
      minSizeMB: false,
      maxSizeMB: false,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        placeholder="검색어 입력"
        value={inputValue}
        onChange={handleInputChange}
        className="h-10 rounded border px-4"
      />

      <select
        onChange={handleTypeChange}
        defaultValue="all"
        className="h-10 rounded border px-3 text-gray-700"
      >
        <option value="all">전체</option>
        <option value="file">파일</option>
        <option value="folder">폴더</option>
      </select>

      {activeFields.updatedAt ?
        <input
          type="date"
          className="h-10 w-48 rounded border px-3"
          onChange={(e) => setFilter("updatedAt", e.target.value)}
        />
      : null}

      {activeFields.minSizeMB ?
        <input
          type="number"
          placeholder="최소 크기(MB)"
          className="h-10 w-32 rounded border px-3"
          onChange={(e) => setFilter("minSizeMB", e.target.value)}
        />
      : null}

      {activeFields.maxSizeMB ?
        <input
          type="number"
          placeholder="최대 크기(MB)"
          className="h-10 w-32 rounded border px-3"
          onChange={(e) => setFilter("maxSizeMB", e.target.value)}
        />
      : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            className="flex h-10 items-center gap-1 rounded border bg-white px-3 text-gray-500 hover:bg-gray-100"
          >
            조건 선택
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuCheckboxItem
            checked={activeFields.name}
            onCheckedChange={() => toggleField("name")}
          >
            이름
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={activeFields.updatedAt}
            onCheckedChange={() => toggleField("updatedAt")}
          >
            수정일
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={activeFields.minSizeMB}
            onCheckedChange={() => toggleField("minSizeMB")}
          >
            최소 크기(MB)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={activeFields.maxSizeMB}
            onCheckedChange={() => toggleField("maxSizeMB")}
          >
            최대 크기(MB)
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>
            <Button
              type="button"
              onClick={resetAll}
              className="h-9 w-full rounded bg-gray-300 text-black hover:bg-gray-400"
            >
              초기화
            </Button>
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
