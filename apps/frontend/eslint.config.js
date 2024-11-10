import frontendConfig from "@cirrodrive/eslint-config/frontend";

/**
 * @type {import("typescript-eslint").Config}
 */
export default [
  {
    ignores: ["dist/**"],
  },
  ...frontendConfig,
];
