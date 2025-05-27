import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import typescriptConfig from "./configs/typescript.js";
import vitestConfig from "./configs/vitest.js";
import turboConfig from "./configs/turbo.js";
import rules from "./rules/index.js";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "**/*.d.ts",
      "**/*.js",
    ],
  },
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
  {
    extends: [...typescriptConfig, ...vitestConfig, ...turboConfig],
  },
  {
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/unbound-method": "off",
      "tsdoc/syntax": "off",
    },
  },
  {
    ignores: ["**/*.d.ts"],
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            kebabCase: true,
          },
        },
      ],
    },
  },
);
