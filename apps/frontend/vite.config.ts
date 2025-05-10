import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export -- Vite requires default export
export default defineConfig({
  test: {
    coverage: {
      exclude: ["**/node_modules/**", "**/index.ts"],
    },
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest-setup.ts",
    outputFile: ".cache/vitest-report.json",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ],
});
