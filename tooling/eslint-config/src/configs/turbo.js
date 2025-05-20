import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

export default tseslint.config({
  plugins: {
    turbo: turboPlugin,
  },
  rules: {
    ...turboPlugin.configs.recommended.rules,
  },
});
