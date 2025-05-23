import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import base from "./base.ts";

export default {
  content: base.content,
  presets: [base],
  theme: {},
  plugins: [animate],
} satisfies Config;
