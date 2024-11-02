import tseslint from "typescript-eslint";

import baseConfig from "./configs/_base.js";
import typescriptConfig from "./configs/typescript.js";
import vitestConfig from "./configs/vitest.js";

import turboPlugin from "eslint-plugin-turbo";
export default tseslint.config(
  {
    ignores: ["dist/**"],
  },
  {
    extends: [...baseConfig, ...typescriptConfig, ...vitestConfig],
  },
  {
    plugins: {
      turbo: turboPlugin,
    },
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
    files: ["**/*.js"],
    rules: {
      "import/no-default-export": "off",
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          case: "pascalCase",
        },
      ],
    },
  },
  {
    files: ["**/*.ts"],
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          case: "camelCase",
        },
      ],
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "unicorn/filename-case": ["off"],
    },
  },
);
