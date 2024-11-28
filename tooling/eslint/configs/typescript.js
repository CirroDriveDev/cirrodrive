import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

import rules from "../rules/index.js";

export default tseslint.config({
  files: ["**/*.ts", "**/*.tsx"],
  extends: [
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    importPlugin.flatConfigs.typescript,
    eslintConfigPrettier,
    rules.typescript,
    rules.typescriptExtension,
    rules.typescriptImport,
    rules.tsdoc,
  ],
});
