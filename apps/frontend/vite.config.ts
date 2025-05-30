import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { ValidateEnv } from "@julr/vite-plugin-validate-env";

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export -- Vite requires default export
export default defineConfig({
  test: {
    coverage: {
      exclude: ["**/node_modules/**", "**/index.ts"],
    },
    environment: "jsdom",
    globals: true,
    setupFiles: "./test/vitest-setup.ts",
    outputFile: ".cache/vitest-report.json",
  },
  plugins: [
    react(),
    ValidateEnv({
      configFile: "env",
    }),
  ],
});
