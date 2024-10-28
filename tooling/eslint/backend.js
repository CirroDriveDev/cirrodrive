import tseslint from "typescript-eslint";

import base from "./base.js";

export default tseslint.config(
  {
    extends: [...base],
  },
  {
    rules: {
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
);
