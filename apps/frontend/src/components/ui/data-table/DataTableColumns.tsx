import {
  type DisplayColumnDef,
  type AccessorFnColumnDef,
} from "@tanstack/react-table";
import { DataTableColumnHeader } from "./DataTableColumnHeader.js";
import {
  TextCell,
  DateCell,
  NumberCell,
  CurrencyCell,
  BooleanCell,
  StatusCell,
  ActionsCell,
  SelectCell,
  SelectAllCell,
} from "./DataTableCells.js";
import {
  type StatusConfig,
  type BaseRowData,
  type DataTableActionItem,
} from "./types.js";

export function dataTableIdColumn<TData extends BaseRowData>(
  options?: AccessorFnColumnDef<TData, string>,
): AccessorFnColumnDef<TData, string> {
  return {
    header: (props) => (
      <DataTableColumnHeader column={props.column} title="ID" />
    ),
    cell: (props) => <TextCell cell={props.cell} />,
    enableSorting: true,
    size: 80,
    ...options,
    id: "id",
    accessorFn: (row) => row.id,
  };
}

export function dataTableTextColumn<TData, TValue extends string = string>(
  options: AccessorFnColumnDef<TData, TValue> & {
    title: string;
    maxLength?: number;
  },
): AccessorFnColumnDef<TData, TValue> {
  return {
    header: (props) => (
      <DataTableColumnHeader column={props.column} title={options.title} />
    ),
    cell: (props) => (
      <TextCell cell={props.cell} maxLength={options.maxLength} />
    ),
    enableSorting: true,
    size: 160,
    ...options,
  };
}

export function dataTableNumberColumn<TData>(
  options: AccessorFnColumnDef<TData, number> & {
    title: string;
    formatOptions?: Intl.NumberFormatOptions;
  },
): AccessorFnColumnDef<TData, number> {
  return {
    header: (props) => (
      <DataTableColumnHeader column={props.column} title={options.title} />
    ),
    cell: (props) => (
      <NumberCell cell={props.cell} formatOptions={options.formatOptions} />
    ),
    enableSorting: true,
    size: 100,
    ...options,
  };
}

export function dataTableCurrencyColumn<TData>(
  options: AccessorFnColumnDef<TData, number> & {
    title: string;
    currency?: string;
  },
): AccessorFnColumnDef<TData, number> {
  return {
    header: (props) => (
      <DataTableColumnHeader column={props.column} title={options.title} />
    ),
    cell: (props) => (
      <CurrencyCell cell={props.cell} currency={options.currency} />
    ),
    enableSorting: true,
    size: 120,
    ...options,
  };
}

export function dataTableBooleanColumn<TData>(
  options: AccessorFnColumnDef<TData, boolean> & {
    title: string;
    trueLabel?: string;
    falseLabel?: string;
  },
): AccessorFnColumnDef<TData, boolean> {
  return {
    header: (props) => (
      <DataTableColumnHeader column={props.column} title={options.title} />
    ),
    cell: (props) => (
      <BooleanCell
        cell={props.cell}
        trueLabel={options.trueLabel}
        falseLabel={options.falseLabel}
      />
    ),
    enableSorting: true,
    size: 80,
    ...options,
  };
}

export function dataTableDateColumn<TData>(
  options: AccessorFnColumnDef<TData, Date> & {
    title: string;
    formatOptions?: Intl.DateTimeFormatOptions;
  },
): AccessorFnColumnDef<TData, Date> {
  return {
    header: (props) => (
      <DataTableColumnHeader column={props.column} title={options.title} />
    ),
    cell: (props) => (
      <DateCell cell={props.cell} formatOptions={options.formatOptions} />
    ),
    enableSorting: true,
    size: 160,
    ...options,
  };
}

export function dataTableStatusColumn<TData>(
  options: AccessorFnColumnDef<TData, string> & {
    title: string;
    statusConfig: StatusConfig;
  },
): AccessorFnColumnDef<TData, string> {
  return {
    header: (props) => (
      <DataTableColumnHeader column={props.column} title={options.title} />
    ),
    cell: (props) => (
      <StatusCell cell={props.cell} statusConfig={options.statusConfig} />
    ),
    enableSorting: true,
    size: 120,
    ...options,
  };
}

export function dataTableActionsColumn<TData>(
  options: Omit<DisplayColumnDef<TData>, "id"> & {
    title?: string;
    actions: DataTableActionItem<TData>[];
  },
): DisplayColumnDef<TData> {
  return {
    id: "actions",
    header: options.title ?? "--",
    cell: ({ row }) => <ActionsCell row={row} actions={options.actions} />,
    enableSorting: false,
    enableHiding: false,
    size: 60,
    ...options,
  };
}

export function dataTableSelectColumn<TData>(
  options?: DisplayColumnDef<TData>,
): DisplayColumnDef<TData> {
  return {
    id: "select",
    header: (props) => <SelectAllCell table={props.table} />,
    cell: (props) => <SelectCell row={props.row} />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
    ...options,
  };
}
