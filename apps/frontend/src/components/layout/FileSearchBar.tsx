import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  useFileSearchBarStore,
  type EntryType,
} from "#store/useFileSearchBarStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "#shadcn/components/DropdownMenu.js";
import { Input } from "#shadcn/components/Input.js";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "#shadcn/components/Select.js";
import { Button } from "#shadcn/components/Button.js";

export function FileSearchBar(): JSX.Element {
  const { setFilter, resetFilters } = useFileSearchBarStore();

  const [activeFields, setActiveFields] = useState({
    name: true,
    updatedAt: false,
    minSizeMB: false,
    maxSizeMB: false,
  });

  const toggleField = (field: keyof typeof activeFields) => {
    setActiveFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTypeChange = (value: string) => {
    setFilter("type", value as EntryType);
  };

  const resetAll = () => {
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
      <Select defaultValue="all" onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="종류 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          <SelectItem value="file">파일</SelectItem>
          <SelectItem value="folder">폴더</SelectItem>
        </SelectContent>
      </Select>

      {activeFields.updatedAt ? <Input
          type="date"
          className="w-48"
          onChange={(e) => setFilter("updatedAt", e.target.value)}
        /> : null}

      {activeFields.minSizeMB ? <Input
          type="number"
          placeholder="최소 크기(MB)"
          className="w-32"
          onChange={(e) => setFilter("minSizeMB", e.target.value)}
        /> : null}

      {activeFields.maxSizeMB ? <Input
          type="number"
          placeholder="최대 크기(MB)"
          className="w-32"
          onChange={(e) => setFilter("maxSizeMB", e.target.value)}
        /> : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1">
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

          <div className="px-2 py-1">
            <Button
              type="button"
              onClick={resetAll}
              variant="secondary"
              className="w-full"
            >
              초기화
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
