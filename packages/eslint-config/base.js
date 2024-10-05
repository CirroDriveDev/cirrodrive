const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    require.resolve("@vercel/style-guide/eslint/node"),
    require.resolve("@vercel/style-guide/eslint/typescript"),
    require.resolve("@vercel/style-guide/eslint/vitest"),
    "turbo",
  ],
  plugins: ["only-warn"],
  ignorePatterns: [
    "dist/",
    "build/",
    "coverage/",
    "node_modules/",
    "*.js",
    "*.jsx",
  ],
  parserOptions: {
    project,
  },
  rules: {
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
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  overrides: [
    {
      files: ["*.tsx"],
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
      files: ["*.ts"],
      rules: {
        "unicorn/filename-case": [
          "error",
          {
            case: "camelCase",
            ignore: ["^(.*).d.ts$"],
          },
        ],
      },
    },
  ],
};
