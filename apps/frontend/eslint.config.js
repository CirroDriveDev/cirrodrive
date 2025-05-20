import reactConfig from "@cirrodrive/eslint-config/react";

/**
 * @type {import("typescript-eslint").Config}
 */
export default [
  {
    ignores: ["dist/**"],
  },
  ...reactConfig,
];
