// 저장 용량(MB)을 GB, TB 단위로 보기 좋게 변환
export function formatStorage(mb: number): string {
  if (mb >= 1024 * 1024) {
    return `${(mb / (1024 * 1024)).toFixed(2).replace(/\.00$/, "")} TB`;
  }
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2).replace(/\.00$/, "")} GB`;
  }
  return `${mb} MB`;
}
