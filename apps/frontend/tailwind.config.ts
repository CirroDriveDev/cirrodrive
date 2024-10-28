import type { Config } from "tailwindcss";
import webConfig from "@cirrodrive/tailwind-config/web";

// eslint-disable-next-line import/no-default-export -- Tailwind CSS requires default export
export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [webConfig],
} satisfies Config;
