import tseslint from "typescript-eslint";

import base from "./base.js";

export default tseslint.config(
  {
    extends: [...base],
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
