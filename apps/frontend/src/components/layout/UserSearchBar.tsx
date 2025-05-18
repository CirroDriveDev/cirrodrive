import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useUserSearchBarStore } from "@/store/useUserSearchBarStore.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/shadcn/components/DropdownMenu.tsx";
import { Button } from "@/shadcn/components/Button.tsx";

export function UserSearchBar(): JSX.Element {
  const { setSearchTerm, resetSearch } = useUserSearchBarStore();
  const [inputValue, setInputValue] = useState<string>("");
  const [searchFields, setSearchFields] = useState<{
    id: boolean;
    username: boolean;
    email: boolean;
    createdAt: boolean;
    currentPlanId: boolean;
  }>({
    id: true,
    username: false,
    email: false,
    createdAt: false,
    currentPlanId: false,
  });

  const toggleField = (field: keyof typeof searchFields): void => {
    setSearchFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setInputValue(value);

    setSearchTerm(value);
  };

  const resetAll = (): void => {
    setInputValue("");
    resetSearch();
    setSearchFields({
      id: true,
      username: false,
      email: false,
      createdAt: false,
      currentPlanId: false,
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
          <Button
            type="button"
            className="flex h-10 items-center gap-1 rounded border bg-white px-3 text-gray-500 hover:bg-gray-100"
          >
            조건 선택
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          <DropdownMenuCheckboxItem
            checked={searchFields.id}
            onCheckedChange={() => toggleField("id")}
          >
            ID
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={searchFields.username}
            onCheckedChange={() => toggleField("username")}
          >
            유저네임
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={searchFields.email}
            onCheckedChange={() => toggleField("email")}
          >
            이메일
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={searchFields.createdAt}
            onCheckedChange={() => toggleField("createdAt")}
          >
            가입일
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={searchFields.currentPlanId}
            onCheckedChange={() => toggleField("currentPlanId")}
          >
            등급
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
