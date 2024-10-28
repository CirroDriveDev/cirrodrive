import eslintComments from "eslint-plugin-eslint-comments";

/** @type {import("typescript-eslint").ConfigWithExtends} */
export default {
  plugins: {
    "eslint-comments": eslintComments,
  },

  rules: {
    /**
     * Require comments on ESlint disable directives.
     *
     * 🚫 Not fixable - https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/require-description.html
     */
    "eslint-comments/require-description": "error",
  },
};
