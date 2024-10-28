/**
 * These are enabled by `import/recommended`, but are better handled by
 * TypeScript and @typescript-eslint.
 */
/** @type {import("eslint").Linter.RulesRecord} */
const disabledRules = {
  "import/default": "off",
  "import/export": "off",
  "import/namespace": "off",
  "import/no-unresolved": "off",
};

/** @type {import("typescript-eslint").ConfigWithExtends} */
export default {
  rules: {
    ...disabledRules,
  },
};
