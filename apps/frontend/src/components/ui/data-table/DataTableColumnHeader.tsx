import { type Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "#shadcn/lib/utils.js";
import { Button } from "#shadcn/components/Button.js";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const sortState = column.getIsSorted() || "none";

  const columnIcon = {
    desc: <ArrowDown className="h-4 w-4" />,
    asc: <ArrowUp className="h-4 w-4" />,
    none: <ChevronsUpDown className="h-4 w-4" />,
  }[sortState];

  const handleCycleSort = () => {
    if (!column.getCanSort()) {
      return; // Ignore clicks if sorting is disabled
    }
    // Cycle through: none -> asc -> desc -> none
    switch (sortState) {
      case "none":
        column.toggleSorting(false); // Sort ascending
        break;
      case "asc":
        column.toggleSorting(true); // Sort descending
        break;
      case "desc":
        column.clearSorting(); // Clear sorting
        break;
    }
  };

  return (
    <div className={cn("flex", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 flex h-8 justify-start hover:bg-accent"
        onClick={handleCycleSort}
      >
        <span>{title}</span>
        {column.getCanSort() ? columnIcon : null}
      </Button>
    </div>
  );
}
