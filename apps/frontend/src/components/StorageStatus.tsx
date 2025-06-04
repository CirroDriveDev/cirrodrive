import { AlertCircle, HardDrive, CheckCircle } from "lucide-react";
import { useStorage } from "#services/file/useStorage.js";
import { formatStorage } from "#utils/formatStorage.js";

/**
 * 사용자 저장소 사용량을 시각적으로 표시하는 컴포넌트
 *
 * @returns JSX.Element (용량 바, 상태 메시지 등 포함)
 */
export function StorageStatus(): JSX.Element {
  const { used, quota, isNearLimit, isPending } = useStorage();

  // 사용량 및 퍼센트 계산
  const percent = quota > 0 ? Math.min((used / quota) * 100, 100) : 0;
  const remaining = Math.max(quota - used, 0);
  
  // 상태별 색상 및 아이콘 결정
  const getStatusColor = () => {
    if (percent >= 100) return "text-red-600";
    if (percent >= 90) return "text-amber-600";
    if (percent >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = () => {
    if (percent >= 100) return "bg-red-500";
    if (percent >= 90) return "bg-amber-500";
    if (percent >= 75) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getStatusIcon = () => {
    if (percent >= 100) return <AlertCircle className="h-4 w-4" />;
    if (percent >= 90) return <AlertCircle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusMessage = () => {
    if (percent >= 100) return "⚠️ 저장 공간이 가득 찼습니다!";
    if (percent >= 90) return "⚠️ 저장 공간이 거의 찼습니다.";
    if (percent >= 75) return "💡 저장 공간을 정리하는 것을 고려해보세요.";
    return "✅ 저장 공간이 충분합니다.";
  };

  // 로딩 상태 표시
  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <HardDrive className="h-4 w-4 animate-pulse" />
        저장소 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 border rounded-lg bg-card">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <HardDrive className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">저장소 사용량</span>
      </div>

      {/* 사용량 텍스트 */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          {formatStorage(used)} / {formatStorage(quota)} 사용
        </span>
        <span className={`font-medium ${getStatusColor()}`}>
          {percent.toFixed(1)}%
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div className="relative w-full h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      {/* 남은 용량 표시 */}
      <div className="text-xs text-muted-foreground">
        사용 가능: {formatStorage(remaining)}
      </div>

      {/* 상태 메시지 */}
      {(isNearLimit || percent >= 75) ? <div className={`flex items-center gap-2 text-xs ${getStatusColor()}`}>
          {getStatusIcon()}
          {getStatusMessage()}
        </div> : null}
    </div>
  );
}
