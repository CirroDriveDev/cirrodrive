import baseConfig from "@cirrodrive/prettier-config";

/**
 * @typedef {import("prettier").Config} PrettierConfig
 */
/**
 * @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig
 */

/**
 * @type {PrettierConfig | TailwindConfig}
 */
const config = {
  ...baseConfig,
  plugins: [...baseConfig.plugins, "prettier-plugin-tailwindcss"],

  // prettier-plugin-tailwindcss
  tailwindConfig: "./tailwind.config.ts",
  tailwindFunctions: ["cn", "cva"],
};

export default config;
