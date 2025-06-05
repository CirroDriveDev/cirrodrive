/* eslint-disable no-console -- example */
import { useState } from "react";
import {
  DataTable,
  dataTableIdColumn,
  dataTableTextColumn,
  dataTableDateColumn,
  dataTableNumberColumn,
  dataTableCurrencyColumn,
  dataTableBooleanColumn,
  dataTableStatusColumn,
  dataTableActionsColumn,
  dataTableSelectColumn,
  CommonStatusConfigs,
  CommonActions,
  CommonActionGroups,
  type ExtendRowData,
} from "./index.js";

// 예제 데이터 타입 정의
type ExampleUser = ExtendRowData<{
  name: string;
  email: string;
  age: number;
  salary: number;
  isActive: boolean;
  status: "active" | "inactive" | "pending" | "suspended";
  createdAt: Date;
}>;

// 샘플 데이터
const sampleUsers: ExampleUser[] = [
  {
    id: "1",
    name: "김철수",
    email: "kim@example.com",
    age: 28,
    salary: 5000000,
    isActive: true,
    status: "active",
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "2",
    name: "이영희",
    email: "lee@example.com",
    age: 32,
    salary: 6000000,
    isActive: true,
    status: "active",
    createdAt: new Date("2023-02-20"),
  },
  {
    id: "3",
    name: "박민수",
    email: "park@example.com",
    age: 25,
    salary: 4500000,
    isActive: false,
    status: "inactive",
    createdAt: new Date("2023-03-10"),
  },
  {
    id: "4",
    name: "최지은",
    email: "choi@example.com",
    age: 29,
    salary: 5500000,
    isActive: true,
    status: "pending",
    createdAt: new Date("2023-04-05"),
  },
  {
    id: "5",
    name: "정태영",
    email: "jung@example.com",
    age: 35,
    salary: 7000000,
    isActive: false,
    status: "suspended",
    createdAt: new Date("2023-05-12"),
  },
];

// 기본 DataTable 예제
export function BasicDataTableExample() {
  const columns = [
    dataTableIdColumn<ExampleUser>(),
    dataTableTextColumn<ExampleUser>({
      accessorFn: (row) => row.name,
      id: "name",
      title: "이름",
    }),
    dataTableTextColumn<ExampleUser>({
      accessorFn: (row) => row.email,
      id: "email",
      title: "이메일",
    }),
    dataTableNumberColumn<ExampleUser>({
      accessorFn: (row) => row.age,
      id: "age",
      title: "나이",
    }),
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">기본 DataTable</h2>
      <DataTable<ExampleUser>
        data={sampleUsers}
        columns={columns}
        features={{
          sorting: true,
          filtering: true,
        }}
      />
    </div>
  );
}

// 정렬 가능한 DataTable 예제
export function SortableDataTableExample() {
  const columns = [
    dataTableSelectColumn<ExampleUser>(),
    dataTableIdColumn<ExampleUser>(),
    dataTableTextColumn<ExampleUser>({
      accessorFn: (row) => row.name,
      id: "name",
      title: "이름",
    }),
    dataTableNumberColumn<ExampleUser>({
      accessorFn: (row) => row.age,
      id: "age",
      title: "나이",
    }),
    dataTableCurrencyColumn<ExampleUser>({
      accessorFn: (row) => row.salary,
      id: "salary",
      title: "급여",
      currency: "KRW",
    }),
    dataTableDateColumn<ExampleUser>({
      accessorFn: (row) => row.createdAt,
      id: "createdAt",
      title: "가입일",
      formatOptions: { year: "numeric", month: "2-digit", day: "2-digit" },
    }),
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">정렬 및 선택 가능한 DataTable</h2>
      <DataTable<ExampleUser>
        data={sampleUsers}
        columns={columns}
        features={{
          sorting: true,
          filtering: true,
          rowSelection: true,
        }}
      />
    </div>
  );
}

// 페이지네이션이 있는 DataTable 예제
export function PaginatedDataTableExample() {
  const columns = [
    dataTableIdColumn<ExampleUser>(),
    dataTableTextColumn<ExampleUser>({
      accessorFn: (row) => row.name,
      id: "name",
      title: "이름",
    }),
    dataTableTextColumn<ExampleUser>({
      accessorFn: (row) => row.email,
      id: "email",
      title: "이메일",
      maxLength: 30,
    }),
    dataTableStatusColumn<ExampleUser>({
      accessorFn: (row) => row.status,
      id: "status",
      title: "상태",
      statusConfig: CommonStatusConfigs.user,
    }),
    dataTableBooleanColumn<ExampleUser>({
      accessorFn: (row) => row.isActive,
      id: "isActive",
      title: "활성화",
      trueLabel: "활성",
      falseLabel: "비활성",
    }),
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">페이지네이션이 있는 DataTable</h2>
      <DataTable<ExampleUser>
        data={sampleUsers}
        columns={columns}
        features={{
          sorting: true,
          filtering: true,
          pagination: true,
        }}
        initialState={{
          pagination: {
            pageSize: 3,
          },
        }}
      />
    </div>
  );
}

// 모든 기능이 포함된 DataTable 예제
export function FullFeaturedDataTableExample() {
  const [data, setData] = useState(sampleUsers);

  const handleEdit = (user: ExampleUser) => {
    console.log("편집:", user);
  };

  const handleDelete = (user: ExampleUser) => {
    setData((prev) => prev.filter((item) => item.id !== user.id));
    console.log("삭제:", user);
  };

  const handleResetPassword = (user: ExampleUser) => {
    console.log("비밀번호 재설정:", user);
  };

  const columns = [
    dataTableSelectColumn<ExampleUser>(),
    dataTableIdColumn<ExampleUser>(),
    dataTableTextColumn<ExampleUser>({
      accessorFn: (row) => row.name,
      id: "name",
      title: "이름",
    }),
    dataTableTextColumn<ExampleUser>({
      accessorFn: (row) => row.email,
      id: "email",
      title: "이메일",
      maxLength: 25,
    }),
    dataTableNumberColumn<ExampleUser>({
      accessorFn: (row) => row.age,
      id: "age",
      title: "나이",
    }),
    dataTableCurrencyColumn<ExampleUser>({
      accessorFn: (row) => row.salary,
      id: "salary",
      title: "급여",
      currency: "KRW",
    }),
    dataTableStatusColumn<ExampleUser>({
      accessorFn: (row) => row.status,
      id: "status",
      title: "상태",
      statusConfig: CommonStatusConfigs.user,
    }),
    dataTableBooleanColumn<ExampleUser>({
      accessorFn: (row) => row.isActive,
      id: "isActive",
      title: "활성화",
      trueLabel: "활성",
      falseLabel: "비활성",
    }),
    dataTableDateColumn<ExampleUser>({
      accessorFn: (row) => row.createdAt,
      id: "createdAt",
      title: "가입일",
      formatOptions: { year: "numeric", month: "2-digit", day: "2-digit" },
    }),
    dataTableActionsColumn<ExampleUser>({
      title: "작업",
      actions: [
        CommonActionGroups.userManagement({
          onEdit: handleEdit,
          onResetPassword: handleResetPassword,
          onDelete: handleDelete,
        }),
      ],
    }),
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">모든 기능이 포함된 DataTable</h2>
      <DataTable<ExampleUser>
        data={data}
        columns={columns}
        features={{
          sorting: true,
          filtering: true,
          globalFilter: true,
          pagination: true,
          rowSelection: true,
        }}
        initialState={{
          pagination: {
            pageSize: 5,
          },
        }}
      />
    </div>
  );
}

// 커스텀 액션이 있는 DataTable 예제
export function CustomDataTableExample() {
  const [data, setData] = useState(sampleUsers);

  const handleActivate = (user: ExampleUser) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === user.id ?
          { ...item, isActive: true, status: "active" as const }
        : item,
      ),
    );
  };

  const handleDeactivate = (user: ExampleUser) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === user.id ?
          { ...item, isActive: false, status: "inactive" as const }
        : item,
      ),
    );
  };

  const columns = [
    dataTableIdColumn<ExampleUser>(),
    dataTableTextColumn<ExampleUser>({
      accessorFn: (row) => row.name,
      id: "name",
      title: "이름",
    }),
    dataTableStatusColumn<ExampleUser>({
      accessorFn: (row) => row.status,
      id: "status",
      title: "상태",
      statusConfig: CommonStatusConfigs.user,
    }),
    dataTableActionsColumn<ExampleUser>({
      title: "작업",
      actions: [
        CommonActions.edit((user) => console.log("편집:", user)),
        {
          label: "활성화",
          onClick: handleActivate,
          variant: "default",
          hidden: (user) => user.isActive,
        },
        {
          label: "비활성화",
          onClick: handleDeactivate,
          variant: "destructive",
          hidden: (user) => !user.isActive,
        },
        CommonActions.delete((user) =>
          setData((prev) => prev.filter((item) => item.id !== user.id)),
        ),
      ],
    }),
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">커스텀 액션이 있는 DataTable</h2>
      <DataTable<ExampleUser>
        data={data}
        columns={columns}
        features={{
          sorting: true,
          filtering: true,
        }}
      />
    </div>
  );
}

// DataTable 설정 예제
export const DataTableConfigs = {
  // 기본 설정
  basic: {
    features: {
      sorting: true,
      filtering: false,
      pagination: false,
      rowSelection: false,
      globalFilter: false,
    },
  },

  // 관리자용 설정
  admin: {
    features: {
      sorting: true,
      filtering: true,
      pagination: true,
      rowSelection: true,
      globalFilter: true,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  },

  // 읽기 전용 설정
  readonly: {
    features: {
      sorting: true,
      filtering: true,
      pagination: true,
      rowSelection: false,
      globalFilter: false,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  },
} as const;

// 모든 예제를 보여주는 메인 컴포넌트
export function DataTableExamples() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="mb-4 text-2xl font-bold">DataTable 예제</h1>
        <p className="mb-8 text-gray-600">
          다양한 DataTable 사용 예제를 확인할 수 있습니다.
        </p>
      </div>

      <BasicDataTableExample />
      <SortableDataTableExample />
      <PaginatedDataTableExample />
      <FullFeaturedDataTableExample />
      <CustomDataTableExample />
    </div>
  );
}
