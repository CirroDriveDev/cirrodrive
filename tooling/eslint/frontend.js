import tseslint from "typescript-eslint";

import base from "./base.js";
import reactConfig from "./configs/react.js";

export default tseslint.config(
  {
    extends: [...base, ...reactConfig],
  },
  {
    rules: {
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
  {
    files: ["**/*.ts"],
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            kebabCase: true,
          },
        },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            pascalCase: true,
          },
        },
      ],
    },
  },
  {
    files: ["**/pages/**/*.tsx"],
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
  {
    files: ["**/*.d.ts"],
    rules: {
      "unicorn/filename-case": ["off"],
    },
  },
);
