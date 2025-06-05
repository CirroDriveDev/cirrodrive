import { type Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { DataTableViewOptions } from "./DataTableViewOptions.js";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter.js";
import { type DataTableFeatures } from "./DataTable.js";
import { Input } from "#shadcn/components/Input.js";
import { Button } from "#shadcn/components/Button.js";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchableColumns?: string[];
  searchPlaceholder?: string;
  features?: DataTableFeatures;
  filterOptions?: {
    columnId: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search...",
  features = {},
  filterOptions = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {features.globalFilter ?
          <Input
            placeholder={searchPlaceholder}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        : null}

        {features.filtering ?
          filterOptions.map((filterOption) => (
            <DataTableFacetedFilter
              key={filterOption.columnId}
              column={table.getColumn(filterOption.columnId)}
              title={filterOption.title}
              options={filterOption.options}
            />
          ))
        : null}

        {isFiltered ?
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        : null}
      </div>

      <div className="flex items-center space-x-2">
        {features.columnVisibility ?
          <DataTableViewOptions table={table} />
        : null}
      </div>
    </div>
  );
}
