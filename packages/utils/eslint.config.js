import baseConfig from "@cirrodrive/eslint-config";

export default [
  ...baseConfig,
  {
    rules: {
      "import/no-default-export": "off",
    },
  },
];
