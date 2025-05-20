/**
 * @typedef {import("prettier").Config} PrettierConfig
 */
/**
 * @typedef {import("prettier-plugin-jsdoc").Options} JSDocConfig
 */
/**
 * @typedef {import("prettier-plugin-sort-json").SortJsonOptions} SortJsonConfig
 */

/**
 * @type {PrettierConfig | JSDocConfig | SortJsonConfig}
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
  plugins: ["prettier-plugin-jsdoc", "prettier-plugin-packagejson"],

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

  overrides: [
    {
      excludeFiles: ["**/tsconfig*.json"],
      files: ["**/*.json"],
      options: {
        plugins: [
          "prettier-plugin-jsdoc",
          "prettier-plugin-packagejson",
          "prettier-plugin-sort-json",
        ],
        // prettier-plugin-sort-json
        jsonRecursiveSort: false,
        jsonSortOrder: '{"*": "lexical"}',
      },
    },
  ],
};

export default config;
