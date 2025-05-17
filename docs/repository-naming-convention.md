# Repository 네이밍 컨벤션 가이드라인

본 문서는 Cirrodrive 프로젝트에서 사용하는 Repository 클래스 및 메서드 네이밍 규칙을 정의합니다. 실제 기업(Stripe, Github, Notion 등) 및 업계 표준을 참고하였습니다.

---

## 1. Repository 클래스 네이밍

- 각 도메인 모델명 + `Repository` 접미사 사용
  - 예시: `UserRepository`, `PlanRepository`, `SubscriptionRepository`, `PaymentRepository`, `CardRepository`

---

## 2. CRUD 기본 패턴 및 상세 설명

### **Create**

- **create**: 새 엔티티를 생성합니다.
  - 반환값: 생성된 엔티티
  - 예시: `createUser`, `createOrder`
- **save**: 새 엔티티를 생성하거나, 이미 존재하면 갱신합니다(upsert 사용).
  - 반환값: 생성 또는 갱신된 엔티티
  - 예시: `saveUser`, `saveOrder`

### **Read**

- **findByXxx**: 조건에 맞는 엔티티를 조회합니다. 결과가 없으면 `null` 반환.
  - 반환값: 단일 엔티티 또는 null,
  - 예시: `findById`, `findByEmail`, `findByUserId`, `findAll`
- **getByXxx**: 조건에 맞는 엔티티를 반드시 가져옵니다. 없으면 예외(throw) 또는 에러 반환.
  - 반환값: 단일 엔티티 (없으면 예외 throw)
  - 예시: `getById`, `getByCode`
- **listByXxx**: 조건에 맞는 여러 엔티티를 리스트로 반환합니다.
  - 반환값: 배열
  - 예시: `listByUserId`, `listByStatus`
- **findAll**: 모든 엔티티를 배열로 반환합니다.
  - 반환값: 배열
  - 예시: `findAll`
- **existsByXxx**: 조건에 맞는 엔티티 존재 여부만 반환 (boolean)
  - 반환값: boolean
  - 예시: `existsByEmail`, `existsByUserId`
- **countByXxx**: 조건에 맞는 엔티티 개수 반환 (number)
  - 반환값: number
  - 예시: `countByStatus`, `countByUserId`

### **Update**

- **update**: 엔티티 전체를 수정합니다.
  - 반환값: 수정된 엔티티
  - 예시: `updateUser`, `updateOrder`
- **updateByXxx**: 조건에 맞는 엔티티의 전체 또는 일부 필드를 수정합니다.
  - 반환값: 수정된 엔티티
  - 예시: `updateById`, `updateByEmail`
- **updateStatusByXxx**: 조건에 맞는 엔티티의 상태(status) 필드를 수정합니다.
  - 반환값: 수정된 엔티티
  - 예시: `updateStatusById`, `updateStatusByUserId`

### **Delete**

- **delete**: 엔티티를 삭제합니다.
  - 반환값: 삭제된 엔티티(soft delete의 경우 삭제 시각 등)
  - 예시: `deleteUser`, `deleteOrder`
- **deleteByXxx**: 조건에 맞는 엔티티를 삭제합니다.
  - 반환값: 삭제된 엔티티
  - 예시: `deleteById`, `deleteByCode`, `deleteByUserId`
- **removeByXxx**: 조건에 맞는 엔티티를 삭제(soft delete 의미로도 사용)합니다.
  - 반환값: 삭제된 엔티티 또는 삭제 결과
  - 예시: `removeByUserId`, `removeByStatus`

---

## 3. 네이밍 예시

```typescript
// Create
async create(data: Prisma.PlanUncheckedCreateInput): Promise<Plan>

// Read
async findById(id: string): Promise<Plan | null>
async findAll(): Promise<Plan[]>
async findByUserId(userId: string): Promise<Subscription[]>
async getByCode(code: string): Promise<FileAccessCode | null>
async listByFileOwnerId(userId: string): Promise<FileAccessCode[]>

// Update
async updateStatusById(id: string, status: $Enums.BillingStatus): Promise<Subscription>

// Delete
async deleteById(id: string): Promise<Subscription>
async deleteByCode(code: string): Promise<FileAccessCode>
```

---

## 4. 참고 사항

- 네이밍은 일관성과 명확성을 최우선으로 합니다.
- 단일/다중 결과, 조건, 반환 타입에 따라 접두어(get/find/list/exists/count 등)를 구분합니다.
- 실제 서비스 요구에 따라 추가적인 메서드 네이밍도 위 규칙을 따릅니다.

---

> 이 가이드라인은 프로젝트의 코드 일관성, 유지보수성, 협업 효율성을 높이기 위해 작성되었습니다.
