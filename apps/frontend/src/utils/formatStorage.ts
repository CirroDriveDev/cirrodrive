// 저장 용량(bytes)을 KB, MB, GB, TB 단위로 보기 좋게 변환
export function formatStorage(bytes: number | bigint): string {
  const numBytes = typeof bytes === "bigint" ? Number(bytes) : bytes;
  
  if (numBytes >= 1024 ** 4) {
    return `${(numBytes / (1024 ** 4)).toFixed(2).replace(/\.00$/, "")} TB`;
  }
  if (numBytes >= 1024 ** 3) {
    return `${(numBytes / (1024 ** 3)).toFixed(2).replace(/\.00$/, "")} GB`;
  }
  if (numBytes >= 1024 ** 2) {
    return `${(numBytes / (1024 ** 2)).toFixed(2).replace(/\.00$/, "")} MB`;
  }
  if (numBytes >= 1024) {
    return `${(numBytes / 1024).toFixed(2).replace(/\.00$/, "")} KB`;
  }
  return `${numBytes} B`;
}
