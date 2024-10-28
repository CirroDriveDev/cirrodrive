import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

export default tseslint.config({
  rules: {
    ...turboPlugin.configs.recommended.rules,
  },
});
