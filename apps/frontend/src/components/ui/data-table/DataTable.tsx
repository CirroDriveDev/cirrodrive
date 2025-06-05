import { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTablePagination } from "./DataTablePagination.js";
import { DataTableToolbar } from "./DataTableToolbar.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#shadcn/components/Table.js";

export interface DataTableFeatures {
  sorting?: boolean;
  filtering?: boolean;
  pagination?: boolean;
  columnVisibility?: boolean;
  rowSelection?: boolean;
  globalFilter?: boolean;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  features?: DataTableFeatures;
  searchableColumns?: string[];
  searchPlaceholder?: string;
  noResultsMessage?: string;
  initialState?: {
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    rowSelection?: Record<string, boolean>;
    globalFilter?: string;
    pagination?: {
      pageIndex?: number;
      pageSize?: number;
    };
  };
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint, @typescript-eslint/no-explicit-any -- this is needed for the generic type TData
export function DataTable<TData, TValue extends any = any>({
  columns,
  data,
  features = {},
  searchableColumns = [],
  searchPlaceholder = "Search",
  noResultsMessage = "No results.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const toolbar =
    features.filtering ?? features.globalFilter ?? features.columnVisibility;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(features.pagination && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
    enableSorting: features.sorting === true,
    ...(features.sorting && {
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
    }),
    enableColumnFilters: features.filtering === true,
    ...(features.filtering && {
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
    }),
    ...(features.columnVisibility && {
      onColumnVisibilityChange: setColumnVisibility,
    }),
    enableRowSelection: features.rowSelection === true,
    ...(features.rowSelection && {
      onRowSelectionChange: setRowSelection,
    }),
    enableGlobalFilter: features.globalFilter === true,
    ...(features.globalFilter && {
      onGlobalFilterChange: setGlobalFilter,
      globalFilterFn: "includesString",
    }),
    enableColumnResizing: false,
    enableColumnPinning: false,
    enableGrouping: false,
    enableExpanding: false,
    state: {
      ...(features.sorting && { sorting }),
      ...(features.filtering && { columnFilters }),
      ...(features.columnVisibility && { columnVisibility }),
      ...(features.rowSelection && { rowSelection }),
      ...(features.globalFilter && { globalFilter }),
    },
  });

  return (
    <div className="space-y-4">
      {toolbar === true && (
        <DataTableToolbar
          table={table}
          searchableColumns={searchableColumns}
          searchPlaceholder={searchPlaceholder}
          features={features}
        />
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ?
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {noResultsMessage}
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>
      {features.pagination === true && <DataTablePagination table={table} />}
    </div>
  );
}
