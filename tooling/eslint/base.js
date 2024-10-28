import tseslint from "typescript-eslint";

import baseConfig from "./configs/_base.js";
import typescriptConfig from "./configs/typescript.js";
import vitestConfig from "./configs/vitest.js";

export default tseslint.config(
  {
    ignores: ["dist/**"],
  },
  {
    extends: [...baseConfig, ...typescriptConfig, ...vitestConfig],
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
