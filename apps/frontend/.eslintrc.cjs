/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@cirrodrive/eslint-config/frontend.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.app.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
};
