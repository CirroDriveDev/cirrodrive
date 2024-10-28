import vitestPlugin from "@vitest/eslint-plugin";
import tseslint from "typescript-eslint";

import rules from "../rules/index.js";

export default tseslint.config({
  extends: [vitestPlugin.configs.recommended, rules.vitest],
});
