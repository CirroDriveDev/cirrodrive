#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { Project } from "ts-morph";

/**
 * Tsconfig.json의 include에 해당하는 모든 파일 경로를 반환합니다.
 *
 * @param tsconfigPath Tsconfig.json의 경로
 */
export function extractIncludedFilePaths(tsconfigPath: string): string[] {
  if (!fs.existsSync(tsconfigPath)) {
    throw new Error(`tsconfig.json not found: ${tsconfigPath}`);
  }
  const project = new Project({ tsConfigFilePath: tsconfigPath });
  const sourceFiles = project.getSourceFiles();
  return sourceFiles.map((sf) => sf.getFilePath());
}

/**
 * 주어진 디렉터리(및 하위 디렉터리)에서 tsconfig*.json 파일의 전체 경로를 모두 반환합니다.
 *
 * @param rootDir 검색을 시작할 루트 디렉터리
 * @returns Tsconfig*.json 파일의 절대 경로 배열
 */
export function findAllTsconfigFiles(rootDir: string): string[] {
  const result: string[] = [];
  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // node_modules, .git 등은 스킵
        if (
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === ".turbo"
        )
          continue;
        walk(fullPath);
      } else if (
        entry.isFile() &&
        /^tsconfig(?:\.[^.]+)?\.json$/.test(entry.name)
      ) {
        result.push(fullPath);
      }
    }
  }
  walk(rootDir);
  return result;
}
/**
 * TypeScript import/export 구문에서 상대경로의 파일 확장자를 제거합니다.
 *
 * @param sourceCode 원본 TypeScript 소스 코드
 * @returns 확장자가 제거된 소스 코드
 */
export function removeImportExtensions(sourceCode: string): string {
  // import/export 구문에서만 .js/.ts/.tsx/.mjs/.cjs 확장자를 제거
  // 예: import x from './foo.ts' -> import x from './foo'
  //     import x from '#types/foo.ts' -> import x from '#types/foo'
  //     export { x } from '../bar.js' -> export { x } from '../bar'
  return sourceCode.replace(
    /(?<prefix>import\s+[^;]*?from\s+|export\s+[^;]*?from\s+)(?<path>["'`][^"'`]+?)(?:\.(?:js|ts|tsx|mjs|cjs))(?<quote>["'`])/g,
    "$<prefix>$<path>$<quote>",
  );
}

/**
 * 주어진 파일 목록에 대해 변환 함수를 적용하고, 변경된 경우 파일을 덮어씁니다.
 *
 * @param filePaths 파일 경로 배열
 * @param transform (code: string, filePath: string) => string 변환 함수
 * @returns 실제로 변경된 파일 경로 배열
 */
export function applyToFiles(
  filePaths: string[],
  transform: (code: string, filePath: string) => string,
): string[] {
  const changed: string[] = [];
  for (const filePath of filePaths) {
    const original = fs.readFileSync(filePath, "utf8");
    const updated = transform(original, filePath);
    if (updated !== original) {
      fs.writeFileSync(filePath, updated, "utf8");
      changed.push(filePath);
    }
  }
  return changed;
}

/**
 * 여러 파일에 대해 import/export 구문의 상대경로 확장자를 일괄 제거합니다.
 *
 * @param filePaths TypeScript 파일 경로 배열
 * @returns 실제로 변경된 파일 경로 배열
 */
export function removeImportExtensionsFromFiles(filePaths: string[]): string[] {
  return applyToFiles(filePaths, (code) => removeImportExtensions(code));
}

// CLI 엔트리포인트: tsx로 실행 시 동작
if (
  typeof process !== "undefined" &&
  process.argv[1] &&
  (process.argv[1] === new URL("", import.meta.url).pathname ||
    process.argv[1].endsWith("remove-ext.ts"))
) {
  // 간단한 CLI: tsconfig 경로 또는 파일 목록을 인자로 받음
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run") || args.includes("-d");
  const filteredArgs = args.filter((a) => a !== "--dry-run" && a !== "-d");
  if (filteredArgs.length === 0) {
    process.stderr.write(
      "사용법: tsx remove-ext.ts [--dry-run|-d] <tsconfig.json 경로 | 파일1.ts 파일2.ts ...>\n",
    );
    process.exit(1);
  }
  let filePaths: string[] = [];
  let tsconfigPath: string | undefined;
  if (filteredArgs.length === 1 && filteredArgs[0].endsWith(".json")) {
    // tsconfig 경로가 주어진 경우
    tsconfigPath = filteredArgs[0];
    process.stdout.write(`🔍 tsconfig 처리 중: ${tsconfigPath}\n`);
    filePaths = extractIncludedFilePaths(tsconfigPath);
  } else {
    // 파일 목록이 주어진 경우
    filePaths = filteredArgs;
  }
  const changed: string[] = [];
  for (const filePath of filePaths) {
    const original = fs.readFileSync(filePath, "utf8");
    const updated = removeImportExtensions(original);
    if (updated !== original) {
      if (!dryRun) {
        fs.writeFileSync(filePath, updated, "utf8");
      }
      process.stdout.write(`✅ 수정 완료: ${filePath}\n`);
      changed.push(filePath);
    }
  }
  if (changed.length === 0) {
    process.stdout.write("🟢 모든 파일이 이미 최신 상태입니다.\n");
  } else {
    process.stdout.write(`✨ 확장자 제거 완료: ${changed.length}개 파일\n`);
    for (const f of changed) process.stdout.write(`   - ${f}\n`);
    process.stdout.write("🎉 작업이 모두 완료되었습니다!\n");
  }
}
