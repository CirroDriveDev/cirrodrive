import tsconfigPaths from "vite-tsconfig-paths";
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
    setupFiles: "./vitestSetup.ts",
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  plugins: [react(), tsconfigPaths()],
});
