import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

import rules from "../rules/index.js";

export default tseslint.config(
  {
    plugins: {
      import: importPlugin,
      turbo: turboPlugin,
    },
    extends: [
      eslint.configs.recommended,
      rules.bestPractice,
      rules.comments,
      rules.es6,
      rules.import,
      rules.possibleErrors,
      rules.stylistic,
      rules.unicorn,
      rules.variables,
    ],
    rules: {
      ...turboPlugin.configs.recommended.rules,
      "import/extensions": ["error", "ignorePackages"],
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            pascalCase: true,
          },
        },
      ],
    },
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
