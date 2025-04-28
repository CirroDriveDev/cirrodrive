import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAdminSearchBarStore } from "@/shared/store/useAdminSearchBarStore.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/DropdownMenu.tsx";
import { Button } from "@/shared/components/shadcn/Button.tsx";

export function AdminFileSearchBar(): JSX.Element {
  const { setSearchTerm, resetSearchTerms } = useAdminSearchBarStore();
  const [inputValue, setInputValue] = useState<string>("");
  const [searchFields, setSearchFields] = useState<{
    name: boolean;
    ownerName: boolean;
    pricingPlan: boolean;
    createdAt: boolean;
  }>({
    name: true,
    ownerName: false,
    pricingPlan: false,
    createdAt: false,
  });

  const toggleField = (field: keyof typeof searchFields): void => {
    setSearchFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setInputValue(value);

    setSearchTerm("name", searchFields.name ? value : "");
    setSearchTerm("ownerName", searchFields.ownerName ? value : "");
    setSearchTerm("pricingPlan", searchFields.pricingPlan ? value : "");
    setSearchTerm("createdAt", searchFields.createdAt ? value : "");
  };

  const resetAll = (): void => {
    setInputValue("");
    resetSearchTerms();
    setSearchFields({
      name: true,
      ownerName: false,
      pricingPlan: false,
      createdAt: false,
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
          <button
            type="button"
            className="flex h-10 items-center gap-1 rounded border bg-white px-3 hover:bg-gray-100"
          >
            조건 선택
            <ChevronDown className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          <DropdownMenuCheckboxItem
            checked={searchFields.name}
            onCheckedChange={() => toggleField("name")}
          >
            파일명
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={searchFields.ownerName}
            onCheckedChange={() => toggleField("ownerName")}
          >
            유저명
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={searchFields.pricingPlan}
            onCheckedChange={() => toggleField("pricingPlan")}
          >
            요금제
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={searchFields.createdAt}
            onCheckedChange={() => toggleField("createdAt")}
          >
            생성일
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
