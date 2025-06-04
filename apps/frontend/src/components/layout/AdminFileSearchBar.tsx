import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAdminSearchBarStore } from "#store/useAdminSearchBarStore.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "#shadcn/components/DropdownMenu.js";
import { Button } from "#shadcn/components/Button.js";

export function AdminFileSearchBar(): JSX.Element {
  const { setSearchTerm, resetSearchTerms } = useAdminSearchBarStore();
  const [inputValue, setInputValue] = useState<string>("");
  // 초기에는 "파일이름"만 선택된 상태입니다.
  const [searchFields, setSearchFields] = useState<{
    name: boolean;
    updatedAt: boolean;
    size: boolean;
    id: boolean;
  }>({
    name: true,
    updatedAt: false,
    size: false,
    id: false,
  });

  // 선택된 조건에 따라 버튼 텍스트를 결정합니다.
  const selectedLabel = useMemo((): string => {
    if (searchFields.name) return "파일이름";
    if (searchFields.updatedAt) return "수정날짜";
    if (searchFields.size) return "크기";
    if (searchFields.id) return "ID";
    return "조건 선택";
  }, [searchFields]);

  // Radio 버튼처럼 한 개의 필드만 선택할 수 있도록 처리합니다.
  const toggleField = (field: keyof typeof searchFields): void => {
    // 만약 선택된 필드를 다시 클릭하면 모두 해제합니다.
    if (searchFields[field]) {
      setSearchFields({
        name: false,
        updatedAt: false,
        size: false,
        id: false,
      });
    } else {
      // 선택되지 않은 필드를 클릭하면 해당 필드만 true로 설정합니다.
      setSearchFields({
        name: false,
        updatedAt: false,
        size: false,
        id: false,
        [field]: true,
      });
    }
    // 검색어를 리셋합니다.
    setSearchTerm("name", "");
    setSearchTerm("updatedAt", "");
    setSearchTerm("size", "");
    setSearchTerm("id", "");
    setInputValue("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setInputValue(value);

    // 한 필드만 true이므로, 해당 필드에만 검색어를 설정합니다.
    if (searchFields.name) {
      setSearchTerm("name", value);
      // 다른 필드 초기화
      setSearchTerm("updatedAt", "");
      setSearchTerm("size", "");
      setSearchTerm("id", "");
    } else if (searchFields.updatedAt) {
      setSearchTerm("updatedAt", value);
      setSearchTerm("name", "");
      setSearchTerm("size", "");
      setSearchTerm("id", "");
    } else if (searchFields.size) {
      setSearchTerm("size", value);
      setSearchTerm("name", "");
      setSearchTerm("updatedAt", "");
      setSearchTerm("id", "");
    } else if (searchFields.id) {
      setSearchTerm("id", value);
      setSearchTerm("name", "");
      setSearchTerm("updatedAt", "");
      setSearchTerm("size", "");
    } else {
      // 아무 필드도 선택되지 않았다면 모두 초기화합니다.
      setSearchTerm("name", "");
      setSearchTerm("updatedAt", "");
      setSearchTerm("size", "");
      setSearchTerm("id", "");
    }
  };

  const resetAll = (): void => {
    setInputValue("");
    resetSearchTerms();
    setSearchFields({
      name: true,
      updatedAt: false,
      size: false,
      id: false,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="검색어 입력"
        value={inputValue}
        onChange={handleInputChange}
        className="h-10 rounded border px-4"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* 버튼 텍스트가 선택된 조건에 따라 변경됩니다. */}
          <Button
            type="button"
            className="flex h-10 items-center gap-1 rounded border bg-white px-3 text-gray-500 hover:bg-gray-100"
          >
            {selectedLabel}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          <DropdownMenuCheckboxItem
            checked={searchFields.name}
            onCheckedChange={() => toggleField("name")}
          >
            파일이름
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={searchFields.updatedAt}
            onCheckedChange={() => toggleField("updatedAt")}
          >
            수정날짜
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={searchFields.size}
            onCheckedChange={() => toggleField("size")}
          >
            크기
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={searchFields.id}
            onCheckedChange={() => toggleField("id")}
          >
            ID
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>
            <Button
              type="button"
              onClick={resetAll}
              className="h-10 rounded bg-gray-300 px-4 text-black hover:bg-gray-400"
            >
              초기화
            </Button>
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
