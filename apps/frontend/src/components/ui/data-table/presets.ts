import {
  type StatusConfig,
  type DataTableAction,
  type DataTableActionGroup,
} from "./types.js";

// Common status configurations that can be reused
export const CommonStatusConfigs = {
  // Active/Inactive status
  activeInactive: {
    active: { label: "Active", className: "bg-green-100 text-green-800" },
    inactive: { label: "Inactive", className: "bg-red-100 text-red-800" },
  } satisfies StatusConfig,

  // Process status
  process: {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    processing: { label: "Processing", className: "bg-blue-100 text-blue-800" },
    completed: { label: "Completed", className: "bg-green-100 text-green-800" },
    failed: { label: "Failed", className: "bg-red-100 text-red-800" },
  } satisfies StatusConfig,

  // User status
  user: {
    active: { label: "Active", className: "bg-green-100 text-green-800" },
    inactive: { label: "Inactive", className: "bg-red-100 text-red-800" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    suspended: {
      label: "Suspended",
      className: "bg-orange-100 text-orange-800",
    },
  } satisfies StatusConfig,

  // Payment status
  payment: {
    paid: { label: "Paid", className: "bg-green-100 text-green-800" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    failed: { label: "Failed", className: "bg-red-100 text-red-800" },
    refunded: { label: "Refunded", className: "bg-gray-100 text-gray-800" },
  } satisfies StatusConfig,
} as const;

// Predefined common actions
export const CommonActions = {
  // CRUD actions
  view: <TData>(onClick: (data: TData) => void): DataTableAction<TData> => ({
    label: "보기",
    onClick,
    variant: "default",
  }),

  edit: <TData>(onClick: (data: TData) => void): DataTableAction<TData> => ({
    label: "수정",
    onClick,
    variant: "default",
  }),

  delete: <TData>(onClick: (data: TData) => void): DataTableAction<TData> => ({
    label: "삭제",
    onClick,
    variant: "destructive",
  }),

  duplicate: <TData>(
    onClick: (data: TData) => void,
  ): DataTableAction<TData> => ({
    label: "복제",
    onClick,
    variant: "default",
  }),

  // Status actions
  activate: <TData>(
    onClick: (data: TData) => void,
  ): DataTableAction<TData> => ({
    label: "활성화",
    onClick,
    variant: "default",
  }),

  deactivate: <TData>(
    onClick: (data: TData) => void,
  ): DataTableAction<TData> => ({
    label: "비활성화",
    onClick,
    variant: "destructive",
  }),

  // File actions
  download: <TData>(
    onClick: (data: TData) => void,
  ): DataTableAction<TData> => ({
    label: "다운로드",
    onClick,
    variant: "default",
  }),

  share: <TData>(onClick: (data: TData) => void): DataTableAction<TData> => ({
    label: "공유",
    onClick,
    variant: "default",
  }),

  // User actions
  resetPassword: <TData>(
    onClick: (data: TData) => void,
  ): DataTableAction<TData> => ({
    label: "비밀번호 재설정",
    onClick,
    variant: "default",
  }),

  sendInvite: <TData>(
    onClick: (data: TData) => void,
  ): DataTableAction<TData> => ({
    label: "초대 보내기",
    onClick,
    variant: "default",
  }),
} as const;

// Helper function to create action groups
export const createActionGroup = <TData>(
  label: string,
  actions: DataTableAction<TData>[],
): DataTableActionGroup<TData> => ({
  label,
  actions,
});

// Common action group presets
export const CommonActionGroups = {
  crud: <TData>(handlers: {
    onView?: (data: TData) => void;
    onEdit?: (data: TData) => void;
    onDelete?: (data: TData) => void;
  }): DataTableActionGroup<TData> => ({
    label: "Actions",
    actions: [
      ...(handlers.onView ? [CommonActions.view(handlers.onView)] : []),
      ...(handlers.onEdit ? [CommonActions.edit(handlers.onEdit)] : []),
      ...(handlers.onDelete ? [CommonActions.delete(handlers.onDelete)] : []),
    ],
  }),

  userManagement: <TData>(handlers: {
    onEdit?: (data: TData) => void;
    onResetPassword?: (data: TData) => void;
    onDelete?: (data: TData) => void;
  }): DataTableActionGroup<TData> => ({
    label: "User Actions",
    actions: [
      ...(handlers.onEdit ? [CommonActions.edit(handlers.onEdit)] : []),
      ...(handlers.onResetPassword ?
        [CommonActions.resetPassword(handlers.onResetPassword)]
      : []),
      ...(handlers.onDelete ? [CommonActions.delete(handlers.onDelete)] : []),
    ],
  }),

  fileManagement: <TData>(handlers: {
    onDownload?: (data: TData) => void;
    onShare?: (data: TData) => void;
    onDelete?: (data: TData) => void;
  }): DataTableActionGroup<TData> => ({
    label: "File Actions",
    actions: [
      ...(handlers.onDownload ?
        [CommonActions.download(handlers.onDownload)]
      : []),
      ...(handlers.onShare ? [CommonActions.share(handlers.onShare)] : []),
      ...(handlers.onDelete ? [CommonActions.delete(handlers.onDelete)] : []),
    ],
  }),
} as const;
