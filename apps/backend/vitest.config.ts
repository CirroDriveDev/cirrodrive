import path from "node:path";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export -- Vite requires default export
export default defineConfig({
  resolve: {
    alias: {
      "#decorators": path.resolve(__dirname, "src/decorators"),
      "#errors": path.resolve(__dirname, "src/errors"),
      "#loaders": path.resolve(__dirname, "src/loaders"),
      "#middlewares": path.resolve(__dirname, "src/middlewares"),
      "#repositories": path.resolve(__dirname, "src/repositories"),
      "#routes": path.resolve(__dirname, "src/routes"),
      "#services": path.resolve(__dirname, "src/services"),
      "#types": path.resolve(__dirname, "src/types"),
      "#utils": path.resolve(__dirname, "src/utils"),
      "#test": path.resolve(__dirname, "test"),
    },
  },
  test: {
    coverage: {
      exclude: ["**/node_modules/**", "**/index.ts"],
    },
    globals: true,
    setupFiles: "./test/vitest-setup.ts",
    fileParallelism: false,
    outputFile: ".cache/vitest-report.json",
  },
});
