import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "#env": path.resolve(__dirname, "src/env.ts"),
    },
  },
  test: {
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      include: ["src/env.ts"],
    },
  },
  plugins: [],
});
