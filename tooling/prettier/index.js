import { fileURLToPath } from "url";

/**
 * @typedef {import("prettier").Config} PrettierConfig
 */
/**
 * @typedef {import("prettier-plugin-jsdoc").Options} JSDocConfig
 */
/**
 * @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig
 */

/**
 * @type {PrettierConfig | JSDocConfig | TailwindConfig}
 */
const config = {
  arrowParens: "always",
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: "auto",
  endOfLine: "lf",
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
  plugins: ["prettier-plugin-jsdoc", "prettier-plugin-tailwindcss"],

  // prettier-plugin-jsdoc
  tsdoc: true,
  // jsdocAddDefaultToDescription: false,
  // jsdocCapitalizeDescription: false,
  jsdocCommentLineStrategy: "multiline",
  // jsdocDescriptionTag: true,
  // jsdocDescriptionWithDot: true,
  // jsdocKeepUnParseAbleExampleIndent: true,
  // jsdocLineWrappingStyle: "greedy",
  // jsdocPreferCodeFences: true,
  // jsdocPrintWidth: undefined,
  // jsdocSeparateReturnsFromParam: true,
  // jsdocSeparateTagGroups: true,
  // jsdocSpaces: 1,
  // jsdocTagsOrder: "undefined",
  // jsdocVerticalAlignment: true,

  // prettier-plugin-tailwindcss
  tailwindConfig: fileURLToPath(
    new URL("../../tooling/tailwind/web.ts", import.meta.url),
  ),
  tailwindFunctions: ["cn", "cva"],
};

export default config;
