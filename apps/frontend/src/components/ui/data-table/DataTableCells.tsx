import { type Cell, type Row, type Table } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import {
  type DataTableAction,
  type DataTableActionGroup,
  type DataTableActionItem,
} from "./types.js";
import { Button } from "#shadcn/components/Button.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "#shadcn/components/DropdownMenu.js";
import { Checkbox } from "#shadcn/components/Checkbox.js";

// Individual cell renderers for common data types

// Text cell with truncation
export function TextCell<TData, TValue extends string = string>(props: {
  cell: Cell<TData, TValue>;
  maxLength?: number;
}) {
  const { cell, maxLength = 50 } = props;
  const value = cell.getValue();

  // Truncate the text if it exceeds the max length
  return (
    <div className="truncate" title={value}>
      {value.length > maxLength ? `${value.slice(0, maxLength)}...` : value}
    </div>
  );
}

// Date cell with formatting
export function DateCell<TData>(props: {
  cell: Cell<TData, Date>;
  formatOptions?: Intl.DateTimeFormatOptions;
}) {
  const { cell, formatOptions } = props;
  const date = cell.getValue();
  return <span>{date.toLocaleDateString(undefined, formatOptions)}</span>;
}

// Number cell with formatting
export function NumberCell<TData>(props: {
  cell: Cell<TData, number>;
  formatOptions?: Intl.NumberFormatOptions;
}) {
  const { cell, formatOptions } = props;
  const value = cell.getValue();
  return <span>{value.toLocaleString(undefined, formatOptions)}</span>;
}

// Currency cell
export function CurrencyCell<TData>(props: {
  cell: Cell<TData, number>;
  currency?: string;
}) {
  const { cell, currency = "KRW" } = props;
  const value = cell.getValue();
  return (
    <span>
      {value.toLocaleString(undefined, {
        style: "currency",
        currency,
      })}
    </span>
  );
}

// Boolean cell with badges
export function BooleanCell<TData>(props: {
  cell: Cell<TData, boolean>;
  trueLabel?: string;
  falseLabel?: string;
}) {
  const { cell, trueLabel = "Yes", falseLabel = "No" } = props;
  const value = cell.getValue();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {value ? trueLabel : falseLabel}
    </span>
  );
}

// Status badge cell
export function StatusCell<TData>(props: {
  cell: Cell<TData, string>;
  statusConfig: Record<string, { label: string; className: string }>;
}) {
  const { cell, statusConfig } = props;
  const value = cell.getValue();
  const config = statusConfig[value] ?? {
    label: value,
    className: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// Link cell
export function LinkCell<TData>(props: {
  cell: Cell<TData, string>;
  href?: string;
}) {
  const { cell, href } = props;
  const value = cell.getValue();
  return (
    <a
      href={href ?? value}
      className="text-blue-600 underline hover:text-blue-800"
      target="_blank"
      rel="noopener noreferrer"
    >
      {value}
    </a>
  );
}

// Image cell
export function ImageCell<TData>(props: {
  cell: Cell<TData, string>;
  alt: string;
  className?: string;
}) {
  const { cell, alt, className = "h-10 w-10" } = props;
  const src = cell.getValue();
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-md object-cover ${className}`}
    />
  );
}

// Actions cell with structured action types
export function ActionsCell<TData>({
  row,
  actions,
}: {
  row: Row<TData>;
  actions: DataTableActionItem<TData>[];
}) {
  const data = row.original;

  // Helper function to check if action should be shown
  const isActionVisible = (action: DataTableAction<TData>): boolean => {
    if (typeof action.hidden === "function") {
      return !action.hidden(data);
    }
    return !action.hidden;
  };

  // Helper function to check if action should be disabled
  const isActionDisabled = (action: DataTableAction<TData>): boolean => {
    if (typeof action.disabled === "function") {
      return action.disabled(data);
    }
    return Boolean(action.disabled);
  };

  // Helper function to render a single action
  const renderAction = (action: DataTableAction<TData>, key: string) => {
    if (!isActionVisible(action)) return null;

    return (
      <DropdownMenuItem
        key={key}
        onClick={() => action.onClick(data)}
        disabled={isActionDisabled(action)}
        className={
          action.variant === "destructive" ?
            "text-red-600 focus:text-red-600"
          : ""
        }
      >
        {action.icon ?
          <action.icon className="mr-2 h-4 w-4" />
        : null}
        {action.label}
      </DropdownMenuItem>
    );
  };

  // Helper function to render action group
  const renderActionGroup = (
    group: DataTableActionGroup<TData>,
    groupIndex: number,
  ) => {
    const visibleActions = group.actions.filter(isActionVisible);
    if (visibleActions.length === 0) return null;

    return (
      <div key={`group-${groupIndex}`}>
        {groupIndex > 0 && <DropdownMenuSeparator />}
        <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
        {visibleActions.map((action, actionIndex) =>
          renderAction(action, `${groupIndex}-${actionIndex}`),
        )}
      </div>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((item, index) => {
          if ("actions" in item) {
            // It's a group
            return renderActionGroup(item, index);
          }
          // It's a single action
          return renderAction(item, `action-${index}`);
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Selection cell for row selection
export function SelectCell<TData>({ row }: { row: Row<TData> }) {
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
      aria-label="Select row"
    />
  );
}

// Header selection cell for selecting all rows
export function SelectAllCell<TData>({ table }: { table: Table<TData> }) {
  return (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={(value) =>
        table.toggleAllPageRowsSelected(Boolean(value))
      }
      aria-label="Select all"
    />
  );
}
