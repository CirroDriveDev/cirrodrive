import { defineConfig } from "@julr/vite-plugin-validate-env";
import { envSchema } from "#app/env.js";

// eslint-disable-next-line import/no-default-export -- for Vite plugin
export default defineConfig({
  validator: "standard",
  schema: envSchema.shape,
});
