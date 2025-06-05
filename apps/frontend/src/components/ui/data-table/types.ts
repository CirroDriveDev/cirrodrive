// General row data types for DataTable components

// Base row data interface that provides common fields
// while allowing extension for specific use cases
export interface BaseRowData {
  id: string;
  [key: string]: unknown;
}

// Common field types that can appear in any row
export interface CommonFields {
  // Identifiers
  id?: string | number;
  name?: string;
  title?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  modifiedAt?: Date;
  deletedAt?: Date;

  // Status and state
  status?: string;
  state?: string;
  isActive?: boolean;
  isDeleted?: boolean;

  // Common metadata
  description?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;

  // Numeric fields
  size?: number;
  count?: number;
  amount?: number;
  price?: number;
}

// Row data that extends base with common fields
export type TableRowData = BaseRowData & Partial<CommonFields>;

// Helper type for creating specific row data types
export type ExtendRowData<T extends Record<string, unknown>> = BaseRowData & T;

// Type guards for common field types
export const isDateField = (value: unknown): value is Date => {
  return value instanceof Date;
};

export const isStringField = (value: unknown): value is string => {
  return typeof value === "string";
};

export const isNumberField = (value: unknown): value is number => {
  return typeof value === "number";
};

export const isBooleanField = (value: unknown): value is boolean => {
  return typeof value === "boolean";
};

// Helper for getting typed values from row data
export const getTypedValue = <T>(row: BaseRowData, key: string): T => {
  return row[key] as T;
};

// Type for status config
export type StatusConfig = Record<string, { label: string; className: string }>;

// Action types for DataTable actions column
export interface DataTableAction<TData = unknown> {
  label: string;
  onClick: (data: TData) => void;
  variant?: "default" | "destructive";
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean | ((data: TData) => boolean);
  hidden?: boolean | ((data: TData) => boolean);
}

export interface DataTableActionGroup<TData = unknown> {
  label: string;
  actions: DataTableAction<TData>[];
}

export type DataTableActionItem<TData = unknown> =
  | DataTableAction<TData>
  | DataTableActionGroup<TData>;
