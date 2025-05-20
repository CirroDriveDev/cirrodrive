import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "#client": path.resolve(__dirname, "src/client.ts"),
      "#src": path.resolve(__dirname, "src/"),
    },
  },
  test: {
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      include: ["src/client.ts", "src/utils.ts"],
    },
  },
  plugins: [],
});
