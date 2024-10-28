/** @type {import("typescript-eslint").ConfigWithExtends} */
export default {
  rules: {
    /**
     * Disallow duplicate setup and teardown hooks.
     *
     * 🚫 Not fixable - https://github.com/veritem/eslint-plugin-vitest/blob/HEAD/docs/rules/no-duplicate-hooks.md
     */
    "vitest/no-duplicate-hooks": "error",
    /**
     * Require lowercase test names.
     * 한글은 소문자로 취급되지 않습니다.
     *
     * 🔧 Fixable - https://github.com/veritem/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-lowercase-title.md
     */
    "vitest/prefer-lowercase-title": "off",
  },
};
