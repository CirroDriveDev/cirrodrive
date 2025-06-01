import { useStorage } from "#services/file/useStorage.js";

/**
 * 사용자 저장소 사용량을 시각적으로 표시하는 컴포넌트
 *
 * @returns JSX.Element (용량 바, 상태 메시지 등 포함)
 */
export function StorageStatus(): JSX.Element {
  const { used, quota, isNearLimit, isPending } = useStorage();

  // 사용량 및 퍼센트 계산
  const usedGB = (used / 1024 ** 3).toFixed(2);
  const quotaGB = (quota / 1024 ** 3).toFixed(2);
  const percent = quota > 0 ? Math.min((used / quota) * 100, 100) : 0;

  // 로딩 상태 표시
  if (isPending) {
    return (
      <div className="text-sm text-muted-foreground">
        저장소 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* 텍스트 상태 */}
      <div className="text-sm text-muted-foreground">
        <span>{usedGB}GB</span> / <span>{quotaGB}GB</span> 사용 중
      </div>

      {/* 프로그레스 바 */}
      <div className="relative w-full h-3 rounded bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* 경고 메시지 */}
      {isNearLimit ?
        <div className="text-sm text-red-600">⚠️ 저장공간이 거의 찼습니다.</div>
      : null}
    </div>
  );
}
