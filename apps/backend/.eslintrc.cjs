/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@cirrodrive/eslint-config/backend.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
