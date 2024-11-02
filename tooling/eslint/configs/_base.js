import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

import rules from "../rules/index.js";

export default tseslint.config(
  {
    extends: [
      eslint.configs.recommended,
      importPlugin.flatConfigs.recommended,
      rules.bestPractice,
      rules.comments,
      rules.es6,
      rules.import,
      rules.possibleErrors,
      rules.stylistic,
      rules.unicorn,
      rules.variables,
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
