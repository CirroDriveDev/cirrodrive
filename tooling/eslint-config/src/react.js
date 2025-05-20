import tseslint from "typescript-eslint";
import baseConfig from "./base.js";
import reactConfig from "./configs/react.js";

export default tseslint.config(
  {
    extends: [...baseConfig, ...reactConfig],
  },
  {
    files: ["**/*.ts"],
    ignores: ["**/*.d.ts"],
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
    files: ["**/components/**/*.tsx"],
    ignores: ["**/pages/**/*.tsx"],
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
);
