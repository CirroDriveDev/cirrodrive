import tseslint from "typescript-eslint";

import base from "./base.js";
import reactConfig from "./configs/react.js";

export default tseslint.config(
  {
    extends: [...base, ...reactConfig],
  },
  {
    rules: {
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
);
