/**
 * 테스트용 파일 생성 유틸리티
 */

/**
 * 지정된 크기의 테스트 파일을 생성합니다.
 */
export function createTestFile(
  sizeInBytes: number,
  fileName = `test-file-${sizeInBytes}.bin`,
  mimeType = 'application/octet-stream'
): File {
  const buffer = new ArrayBuffer(sizeInBytes);
  const view = new Uint8Array(buffer);
  
  // 파일에 패턴 데이터 채우기 (테스트 검증용)
  for (let i = 0; i < sizeInBytes; i++) {
    view[i] = i % 256;
  }
  
  return new File([buffer], fileName, { type: mimeType });
}

/**
 * 다양한 크기의 테스트 파일들을 생성합니다.
 */
export function createTestFiles() {
  return {
    small: createTestFile(1024, 'small.txt', 'text/plain'), // 1KB
    medium: createTestFile(50 * 1024 * 1024, 'medium.jpg', 'image/jpeg'), // 50MB
    large: createTestFile(100 * 1024 * 1024, 'large.zip', 'application/zip'), // 100MB
    extraLarge: createTestFile(500 * 1024 * 1024, 'extra-large.bin'), // 500MB
  };
}

/**
 * 멀티파트 업로드 테스트용 파일 생성
 */
export function createMultipartTestFile(
  chunkCount: number,
  chunkSize = 5 * 1024 * 1024 // 5MB per chunk
): File {
  const totalSize = chunkCount * chunkSize;
  return createTestFile(totalSize, `multipart-${chunkCount}-chunks.bin`);
}

/**
 * 빈 파일 생성
 */
export function createEmptyFile(fileName = 'empty.txt'): File {
  return new File([], fileName, { type: 'text/plain' });
}

/**
 * 랜덤 데이터로 채워진 파일 생성
 */
export function createRandomFile(sizeInBytes: number, fileName?: string): File {
  const buffer = new ArrayBuffer(sizeInBytes);
  const view = new Uint8Array(buffer);
  
  // 랜덤 데이터 채우기
  for (let i = 0; i < sizeInBytes; i++) {
    view[i] = Math.floor(Math.random() * 256);
  }
  
  return new File(
    [buffer], 
    fileName ?? `random-${sizeInBytes}.bin`, 
    { type: 'application/octet-stream' }
  );
}