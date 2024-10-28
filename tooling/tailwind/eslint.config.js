import baseConfig from "@cirrodrive/eslint-config/base";

export default [
  ...baseConfig,
  {
    rules: {
      "import/no-default-export": "off",
    },
  },
];
