import { fixupPluginRules } from "@eslint/compat";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import queryPlugin from "@tanstack/eslint-plugin-query";
import tseslint from "typescript-eslint";
import rules from "../rules/index.js";

export default tseslint.config({
  files: ["**/*.ts", "**/*.tsx"],
  plugins: {
    "react": reactPlugin,
    "react-hooks": fixupPluginRules(hooksPlugin),
  },
  rules: {
    ...hooksPlugin.configs.recommended.rules,
  },
  extends: [
    reactPlugin.configs.flat.recommended,
    reactPlugin.configs.flat["jsx-runtime"],
    importPlugin.flatConfigs.react,
    eslintConfigPrettier,
    rules.react,
    rules.jsxA11y,
    ...queryPlugin.configs["flat/recommended"],
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  languageOptions: {
    globals: {
      React: "writable",
    },
  },
});
