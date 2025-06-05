# DataTable 컴포넌트 문서

## 개요

DataTable은 TanStack React Table v8을 기반으로 구축된 강력하고 유연한 테이블 컴포넌트입니다. 정렬, 필터링, 페이지네이션, 행 선택 등 다양한 기능을 제공하며, 타입 안전성을 보장합니다.

## 주요 특징

- **타입 안전성**: TypeScript로 완전히 타입화된 API
- **모듈화된 설계**: 각 기능을 독립적으로 활성화/비활성화 가능
- **유연한 컬럼 정의**: 다양한 데이터 타입에 대한 미리 정의된 컬럼 헬퍼
- **커스터마이징 가능**: 셀 렌더러, 액션, 스타일을 완전히 커스터마이징 가능
- **반응형 디자인**: 모바일과 데스크톱에서 모두 최적화
- **접근성**: ARIA 속성과 키보드 내비게이션 지원

## 기본 사용법

### 1. 데이터 타입 정의

```typescript
import { type ExtendRowData } from "#components/ui/data-table";

type User = ExtendRowData<{
  name: string;
  email: string;
  age: number;
  status: "active" | "inactive";
}>;
```

### 2. 컬럼 정의

```typescript
import {
  dataTableIdColumn,
  dataTableTextColumn,
  dataTableNumberColumn,
  dataTableStatusColumn,
  CommonStatusConfigs,
} from "#components/ui/data-table";

const columns = [
  dataTableIdColumn<User>(),
  dataTableTextColumn<User>({
    accessorFn: (row) => row.name,
    id: "name",
    title: "이름",
  }),
  dataTableTextColumn<User>({
    accessorFn: (row) => row.email,
    id: "email",
    title: "이메일",
  }),
  dataTableNumberColumn<User>({
    accessorFn: (row) => row.age,
    id: "age",
    title: "나이",
  }),
  dataTableStatusColumn<User>({
    accessorFn: (row) => row.status,
    id: "status",
    title: "상태",
    statusConfig: CommonStatusConfigs.user,
  }),
];
```

### 3. DataTable 렌더링

```typescript
import { DataTable } from "#components/ui/data-table";

function UserTable() {
  return (
    <DataTable<User>
      data={users}
      columns={columns}
      features={{
        sorting: true,
        filtering: true,
        pagination: true,
      }}
    />
  );
}
```

## 컬럼 헬퍼 함수

### dataTableIdColumn

ID 컬럼을 생성합니다.

```typescript
dataTableIdColumn<TData>(options?: AccessorFnColumnDef<TData, string>)
```

### dataTableTextColumn

텍스트 컬럼을 생성합니다.

```typescript
dataTableTextColumn<TData>({
  accessorFn: (row) => row.field,
  id: "field",
  title: "제목",
  maxLength?: number, // 텍스트 최대 길이 (기본값: 50)
})
```

### dataTableNumberColumn

숫자 컬럼을 생성합니다.

```typescript
dataTableNumberColumn<TData>({
  accessorFn: (row) => row.number,
  id: "number",
  title: "숫자",
  formatOptions?: Intl.NumberFormatOptions, // 숫자 포맷 옵션
})
```

### dataTableCurrencyColumn

통화 컬럼을 생성합니다.

```typescript
dataTableCurrencyColumn<TData>({
  accessorFn: (row) => row.amount,
  id: "amount",
  title: "금액",
  currency?: string, // 통화 코드 (기본값: "KRW")
})
```

### dataTableDateColumn

날짜 컬럼을 생성합니다.

```typescript
dataTableDateColumn<TData>({
  accessorFn: (row) => row.date,
  id: "date",
  title: "날짜",
  formatOptions?: Intl.DateTimeFormatOptions, // 날짜 포맷 옵션
})
```

### dataTableBooleanColumn

불린 컬럼을 생성합니다.

```typescript
dataTableBooleanColumn<TData>({
  accessorFn: (row) => row.isActive,
  id: "isActive",
  title: "활성화",
  trueLabel?: string, // true일 때 표시할 텍스트 (기본값: "Yes")
  falseLabel?: string, // false일 때 표시할 텍스트 (기본값: "No")
})
```

### dataTableStatusColumn

상태 배지 컬럼을 생성합니다.

```typescript
dataTableStatusColumn<TData>({
  accessorFn: (row) => row.status,
  id: "status",
  title: "상태",
  statusConfig: CommonStatusConfigs.user, // 상태 설정
})
```

### dataTableActionsColumn

액션 드롭다운 컬럼을 생성합니다.

```typescript
dataTableActionsColumn<TData>({
  title?: string,
  actions: DataTableActionItem<TData>[], // 액션 목록
  size?: number, // 컬럼 너비
})
```

### dataTableSelectColumn

행 선택 체크박스 컬럼을 생성합니다.

```typescript
dataTableSelectColumn<TData>({})
```

## 액션 시스템

### 단일 액션

```typescript
const singleAction: DataTableAction<User> = {
  label: "편집",
  onClick: (user) => handleEdit(user),
  variant: "default", // "default" | "destructive"
  icon: EditIcon, // 선택적 아이콘
  disabled: (user) => !user.isActive, // 조건부 비활성화
  hidden: (user) => user.status === "deleted", // 조건부 숨김
};
```

### 액션 그룹

```typescript
const actionGroup: DataTableActionGroup<User> = {
  label: "사용자 관리",
  actions: [
    CommonActions.edit(handleEdit),
    CommonActions.delete(handleDelete),
  ],
};
```

### 미리 정의된 액션

```typescript
import { CommonActions, CommonActionGroups } from "#components/ui/data-table";

// 개별 액션
CommonActions.view(handleView);
CommonActions.edit(handleEdit);
CommonActions.delete(handleDelete);
CommonActions.activate(handleActivate);
CommonActions.deactivate(handleDeactivate);

// 액션 그룹
CommonActionGroups.crud({
  onView: handleView,
  onEdit: handleEdit,
  onDelete: handleDelete,
});

CommonActionGroups.userManagement({
  onEdit: handleEdit,
  onResetPassword: handleResetPassword,
  onDelete: handleDelete,
});
```

## 상태 설정

### 미리 정의된 상태 설정

```typescript
import { CommonStatusConfigs } from "#components/ui/data-table";

// 활성/비활성
CommonStatusConfigs.activeInactive;

// 프로세스 상태
CommonStatusConfigs.process;

// 사용자 상태
CommonStatusConfigs.user;

// 결제 상태
CommonStatusConfigs.payment;
```

### 커스텀 상태 설정

```typescript
const customStatusConfig: StatusConfig = {
  draft: { label: "초안", className: "bg-gray-100 text-gray-800" },
  published: { label: "게시됨", className: "bg-green-100 text-green-800" },
  archived: { label: "보관됨", className: "bg-blue-100 text-blue-800" },
};
```

## 기능 설정

DataTable의 다양한 기능을 선택적으로 활성화할 수 있습니다:

```typescript
interface DataTableFeatures {
  sorting?: boolean;          // 정렬 기능
  filtering?: boolean;        // 컬럼 필터링
  globalFilter?: boolean;     // 전역 검색
  pagination?: boolean;       // 페이지네이션
  rowSelection?: boolean;     // 행 선택
}
```

### 기능 설정 예제

```typescript
// 기본 기능만
<DataTable
  features={{
    sorting: true,
    filtering: false,
  }}
/>

// 모든 기능 활성화
<DataTable
  features={{
    sorting: true,
    filtering: true,
    globalFilter: true,
    pagination: true,
    rowSelection: true,
  }}
/>
```

## 초기 상태 설정

```typescript
<DataTable
  initialState={{
    pagination: {
      pageSize: 10,
    },
    sorting: [
      {
        id: "name",
        desc: false,
      },
    ],
  }}
/>
```

## 정렬 동작

컬럼 헤더를 클릭하여 정렬 상태를 순환할 수 있습니다:

1. **첫 번째 클릭**: 오름차순 정렬 (↑)
2. **두 번째 클릭**: 내림차순 정렬 (↓)
3. **세 번째 클릭**: 정렬 해제 (↕)

## 셀 컴포넌트

각 데이터 타입에 맞는 셀 컴포넌트를 제공합니다:

- `TextCell`: 텍스트 표시 (자동 말줄임)
- `DateCell`: 날짜 포맷팅
- `NumberCell`: 숫자 포맷팅
- `CurrencyCell`: 통화 포맷팅
- `BooleanCell`: 불린 배지
- `StatusCell`: 상태 배지
- `ActionsCell`: 액션 드롭다운
- `SelectCell`: 선택 체크박스
- `LinkCell`: 링크
- `ImageCell`: 이미지

## 타입 가드

데이터 타입을 안전하게 확인할 수 있는 유틸리티 함수들:

```typescript
import {
  isDateField,
  isStringField,
  isNumberField,
  isBooleanField,
  getTypedValue,
} from "#components/ui/data-table";

if (isStringField(value)) {
  // value는 string 타입으로 추론됨
}

const typedValue = getTypedValue<string>(row, "fieldName");
```

## 스타일링

DataTable은 Tailwind CSS 클래스를 사용하며, shadcn/ui 디자인 시스템을 따릅니다. 커스텀 스타일링을 위해 className prop을 전달할 수 있습니다.

## 접근성

- ARIA 레이블과 역할이 적절히 설정됨
- 키보드 내비게이션 지원
- 스크린 리더 호환성
- 색상에만 의존하지 않는 상태 표시

## 성능 고려사항

- 큰 데이터셋의 경우 가상화 고려
- 메모이제이션을 통한 불필요한 리렌더링 방지
- 액션 핸들러를 useCallback으로 최적화

## 문제 해결

### 일반적인 문제들

1. **타입 에러**: 데이터 타입이 BaseRowData를 확장하는지 확인
2. **액션이 작동하지 않음**: 핸들러 함수가 올바르게 전달되었는지 확인
3. **정렬이 작동하지 않음**: features.sorting이 true로 설정되었는지 확인
4. **스타일이 적용되지 않음**: Tailwind CSS가 올바르게 설정되었는지 확인

### 디버깅 팁

- React DevTools로 컴포넌트 상태 확인
- 브라우저 콘솔에서 에러 메시지 확인
- 데이터 구조가 예상과 일치하는지 확인

## 예제

### 기본 DataTable

```typescript
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
    <DataTable<ExampleUser>
      data={sampleUsers}
      columns={columns}
      features={{
        sorting: true,
        filtering: true,
      }}
    />
  );
}
```

### 정렬 및 선택 가능한 DataTable

```typescript
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
    <DataTable<ExampleUser>
      data={sampleUsers}
      columns={columns}
      features={{
        sorting: true,
        filtering: true,
        rowSelection: true,
      }}
    />
  );
}
```

### 페이지네이션이 있는 DataTable

```typescript
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
  );
}
```

### 모든 기능이 포함된 DataTable

```typescript
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
  );
}
```

### 커스텀 액션이 있는 DataTable

```typescript
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
    <DataTable<ExampleUser>
      data={data}
      columns={columns}
      features={{
        sorting: true,
        filtering: true,
      }}
    />
  );
}
```

## 미리 정의된 설정

### DataTable 설정 예제

```typescript
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
```

### 설정 사용 예제

```typescript
// 관리자용 설정 사용
<DataTable<User>
  data={users}
  columns={columns}
  {...DataTableConfigs.admin}
/>

// 읽기 전용 설정 사용
<DataTable<User>
  data={users}
  columns={columns}
  {...DataTableConfigs.readonly}
/>
```

자세한 사용 예제는 `DataTableExample.tsx` 파일을 참조하세요.
