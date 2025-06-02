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
  server: {
    proxy: {
      "/trpc": {
        // eslint-disable-next-line turbo/no-undeclared-env-vars -- false positive, this is declared in the backend's turbo.json
        target: `http://localhost:${process.env.APP_BACKEND_PORT}`,
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  plugins: [
    react(),
    ValidateEnv({
      configFile: "env",
    }),
  ],
});
