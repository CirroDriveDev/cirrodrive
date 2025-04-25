import path from "node:path";

const DEFAULT_INVALID_CHAR_REGEX = /[/\\/:*?"<>|]/g;

export function sanitizeIllegalCharacters(
  fileName: string,
  invalidCharRegex: RegExp = DEFAULT_INVALID_CHAR_REGEX,
): string {
  return fileName.replace(invalidCharRegex, "_");
}

export function hasNameConflict(
  fileName: string,
  existingNames: string[],
): boolean {
  return existingNames.includes(fileName);
}

/**
 * 파일 이름 충돌을 피하기 위해 고유한 파일 이름을 생성합니다.
 *
 * @param fileName - 원본 파일 이름입니다. (확장자 포함)
 * @param existingNames - 이미 존재하는 파일 이름 목록입니다.
 * @returns 충돌이 없는 파일 이름입니다. (확장자 포함)
 */
export function generateUniqueFileName(
  baseName: string,
  ext: string,
  existingNames: string[],
): string {
  const regexp = /^(?<originalName>.*?)(?: \((?<count>\d+)\))?$/;
  const regexpResult = regexp.exec(baseName);

  const originalName = regexpResult?.groups?.originalName ?? baseName;
  let candidate = `${originalName}${ext}`;
  let counter = 1;

  while (existingNames.includes(candidate)) {
    candidate = `${originalName} (${counter})${ext}`;
    counter++;
  }
  return candidate;
}

/**
 * 안전한 파일 이름을 생성합니다.
 *
 * @param fileName - 원본 파일 이름입니다. (확장자 포함)
 * @param existingNames - 이미 존재하는 파일 이름 목록입니다.
 * @param invalidCharRegex - (선택적) 유효하지 않은 문자 정규식입니다.
 * @returns 생성된 파일 이름입니다 (확장자 포함)
 */
export function generateSafeFileName({
  fileName,
  existingNames,
  invalidCharRegex = DEFAULT_INVALID_CHAR_REGEX,
}: {
  fileName: string;
  existingNames: string[];
  invalidCharRegex?: RegExp;
}): string {
  const sanitizedFileName = sanitizeIllegalCharacters(
    fileName,
    invalidCharRegex,
  );

  if (!hasNameConflict(sanitizedFileName, existingNames)) {
    return sanitizedFileName;
  }

  const ext = path.extname(sanitizedFileName);
  const baseName = path.basename(sanitizedFileName, ext);

  return generateUniqueFileName(baseName, ext, existingNames);
}
