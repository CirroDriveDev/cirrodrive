import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export -- Vite requires default export
export default defineConfig({
  test: {
    coverage: {
      exclude: ["**/node_modules/**", "**/index.ts"],
    },
    globals: true,
    setupFiles: "./vitest-setup.ts",
    fileParallelism: false,
    outputFile: ".cache/vitest-report.json",
  },
  optimizeDeps: {
    include: ["@cirrodrive/database"],
  },
  build: {
    target: "esnext",
    rollupOptions: {
      input: "src/server.ts",
    },
    commonjsOptions: {
      include: ["@cirrodrive/database", /node_modules/],
    },
  },
  ssr: {
    external: ["@cirrodrive/database"],
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  plugins: [tsconfigPaths()],
});
