import { Project } from "ts-morph";
import { globSync } from "glob";
import path from "path";
import fs from "fs";

const extensionsToAdd = [".ts", ".tsx"];
const hasFileExtension = (text: string) => /\.[jt]sx?$/.test(text);
const isRelativePath = (text: string) =>
  text.startsWith("./") || text.startsWith("../");

const isHandledImportPath = (text: string): boolean => {
  return isRelativePath(text) || text.startsWith("@/");
};

// node_modules 제외하고 tsconfig.json 파일 탐색
const tsconfigPaths = globSync("{apps,packages}/**/tsconfig.json", {
  absolute: true,
  ignore: ["**/node_modules/**"],
});

tsconfigPaths.forEach((tsconfigPath) => {
  const baseDir = path.dirname(tsconfigPath);
  const srcDir = path.resolve(baseDir, "src");
  const testDir = path.resolve(baseDir, "test");

  if (!fs.existsSync(tsconfigPath)) return;

  console.log(`🔍 Processing: ${tsconfigPath}`);

  const project = new Project({
    tsConfigFilePath: tsconfigPath,
  });

  project.getSourceFiles().forEach((sourceFile) => {
    const filePath = path.normalize(sourceFile.getFilePath());
    const normalizedSrcDir = path.normalize(srcDir);
    const normalizedTestDir = path.normalize(testDir);

    if (
      !filePath.startsWith(normalizedSrcDir + path.sep) &&
      !filePath.startsWith(normalizedTestDir + path.sep)
    ) {
      return;
    }

    let changed = false;
    const changes: string[] = [];

    sourceFile.getImportDeclarations().forEach((importDecl, index) => {
      const spec = importDecl.getModuleSpecifier();
      const text = spec.getLiteralText();

      if (!isHandledImportPath(text)) return;
      if (hasFileExtension(text)) return;

      let resolvedPath = importDecl
        .getModuleSpecifierSourceFile()
        ?.getFilePath()
        .toString();

      // resolvedPath가 없거나 디렉터리라면 index 파일을 찾음
      if (
        !resolvedPath ||
        (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory())
      ) {
        // 상대 경로를 실제 파일 시스템 경로로 변환
        let dirPath: string;
        if (path.isAbsolute(text)) {
          dirPath = text;
        } else {
          dirPath = path.resolve(path.dirname(filePath), text);
        }
        // index.ts, index.tsx 우선순위로 검색
        for (const ext of extensionsToAdd) {
          const indexFile = path.join(dirPath, `index${ext}`);
          if (fs.existsSync(indexFile)) {
            resolvedPath = indexFile;
            break;
          }
        }
        // index 파일이 없으면 skip
        if (!resolvedPath || fs.statSync(resolvedPath).isDirectory()) return;
      }

      const ext = path.extname(resolvedPath);
      if (!extensionsToAdd.includes(ext)) return;

      // 디렉터리 import였다면 index 확장자를 붙여줌
      let newText: string;
      if (text.endsWith("/")) {
        newText = `${text}index${ext}`;
      } else if (
        fs.existsSync(resolvedPath) &&
        path.basename(resolvedPath).startsWith("index.")
      ) {
        newText = `${text}/index${ext}`;
      } else {
        newText = `${text}${ext}`;
      }
      spec.setLiteralValue(newText);
      changed = true;

      changes.push(
        `  [${index}] ✏️ "${text}" → "${newText}" (from: ${resolvedPath})`,
      );
    });

    if (changed) {
      sourceFile.saveSync();
      console.log(`✅ Fixed: ${filePath}`);
      changes.forEach((line) => console.log(line));
    }
  });
});
console.log("✅ All done! ");
