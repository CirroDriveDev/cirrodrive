// EntryTableWithActions.tsx
import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#shadcn/components/Table.js"

import { Checkbox } from "#shadcn/components/Checkbox.js"
import { Button } from "#shadcn/components/Button.js"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react"

import { formatSize } from "#utils/formatSize.js"
import { EntryIcon } from "#components/EntryIcon.js"
import { EntryActionsDropdown } from "#components/EntryActionsDropdown.js"
import { FileSearchBar } from "#components/layout/FileSearchBar.js"
import type { EntryDTO } from "@cirrodrive/schemas/entry"

export interface CheckedFile {
  fileId: string
  name: string
}

interface Props {
  entries: EntryDTO[]
  checkedFileList: CheckedFile[]
  toggleFileChecked: (file: CheckedFile, isChecked: boolean) => void
  isAllChecked: boolean
  onToggleAll: (checked: boolean) => void
}

export function EntryTableWithActions({
  entries,
  checkedFileList,
  toggleFileChecked,
  isAllChecked,
  onToggleAll,
}: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<EntryDTO>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={isAllChecked}
          onCheckedChange={(checked) => onToggleAll(!!checked)}
          aria-label="전체 선택"
        />
      ),
      cell: ({ row }) => {
        const entry = row.original
        const isChecked = checkedFileList.some(f => f.fileId === entry.id)
        return (
          <Checkbox
            checked={isChecked}
            onCheckedChange={(checked) =>
              toggleFileChecked({ fileId: entry.id, name: entry.name }, !!checked)
            }
          />
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        const isSorted = column.getIsSorted()
        return (
          <Button
            variant="ghost"
            onClick={() => {
              if (!isSorted) column.toggleSorting(false)
              else if (isSorted === "asc") column.toggleSorting(true)
              else setSorting([])
            }}
          >
            이름
            {isSorted === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : isSorted === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const entry = row.original
        return (
          <div className="flex items-center gap-2">
            <EntryIcon variant={entry.type} className="h-4 w-4 text-muted-foreground" />
            <span>{entry.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        const isSorted = column.getIsSorted()
        return (
          <Button
            variant="ghost"
            onClick={() => {
              if (!isSorted) column.toggleSorting(false)
              else if (isSorted === "asc") column.toggleSorting(true)
              else setSorting([])
            }}
          >
            수정일
            {isSorted === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : isSorted === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) =>
        new Date(row.original.updatedAt).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
    },
    {
      accessorKey: "size",
      header: ({ column }) => {
        const isSorted = column.getIsSorted()
        return (
          <div className="flex justify-end pr-[2rem]">
            <Button
              variant="ghost"
              onClick={() => {
                if (!isSorted) column.toggleSorting(false)
                else if (isSorted === "asc") column.toggleSorting(true)
                else setSorting([])
              }}
            >
              크기
              {isSorted === "asc" ? (
                <ChevronUp className="ml-2 h-4" />
              ) : isSorted === "desc" ? (
                <ChevronDown className="ml-2 h-4" />
              ) : (
                <ChevronsUpDown className="ml-2 h-4" />
              )}
            </Button>
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="text-right pr-[2rem]">
          {row.original.size ? formatSize(Number(row.original.size)) : "-"}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => <EntryActionsDropdown entry={row.original} />,
    },
  ]

  const table = useReactTable({
    data: entries,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <FileSearchBar />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  결과 없음
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-2 text-sm text-muted-foreground">
        <div />
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            이전
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  )
}
