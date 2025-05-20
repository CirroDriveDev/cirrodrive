import tseslint from "typescript-eslint";
import baseConfig from "./base.js";

export default tseslint.config(
  {
    extends: [...baseConfig],
  },
  {
    files: ["**/*.ts"],
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
