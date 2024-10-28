import { fileURLToPath } from "url";

/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */

/** @type { PrettierConfig | TailwindConfig } */
const config = {
  arrowParens: "always",
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: "auto",
  endOfLine: "auto",
  experimentalTernaries: true,
  htmlWhitespaceSensitivity: "css",
  insertPragma: false,
  jsxSingleQuote: false,
  printWidth: 80,
  proseWrap: "preserve",
  quoteProps: "consistent",
  requirePragma: false,
  semi: true,
  singleAttributePerLine: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  useTabs: false,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: fileURLToPath(
    new URL("../../tooling/tailwind/web.ts", import.meta.url),
  ),
  tailwindFunctions: ["cn", "cva"],
};

export default config;
