import { Search } from "lucide-react";
import { useTheme } from "@/shared/components/ThemeProvider.tsx";

export function SearchBar(): JSX.Element {
  const { theme } = useTheme();
  const outlineClassList = [
    "outline",
    "outline-1",
    "outline-ring",
    "hover:outline-foreground",
  ];

  const handleFocus = (): void => {
    const searchBarDiv = document.getElementById("searchBarDiv");
    if (searchBarDiv) {
      searchBarDiv.classList.add("outline-none");
      searchBarDiv.classList.remove(...outlineClassList);
    }
  };

  const handleBlur = (): void => {
    const searchBarDiv = document.getElementById("searchBarDiv");
    if (searchBarDiv) {
      searchBarDiv.classList.add(...outlineClassList);
      searchBarDiv.classList.remove("outline-none");
    }
  };

  return (
    <div
      id="searchBarDiv"
      className={`bg-background h-10 max-w-96 flex-grow rounded-md ${outlineClassList.join(
        " ",
      )}`}
    >
      <label className="flex space-x-2 p-2">
        <Search color={theme === "light" ? "black" : "white"} />
        <input
          type="text"
          placeholder="검색"
          className="bg-background text-foreground flex-grow focus:outline-none"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </label>
    </div>
  );
}
