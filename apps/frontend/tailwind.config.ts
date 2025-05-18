import type { Config } from "tailwindcss";
import webConfig from "@cirrodrive/tailwind-config/web";

// eslint-disable-next-line import/no-default-export -- Tailwind CSS requires default export
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  presets: [webConfig],
  theme: {
    extend: {
      fontFamily: {
        "orbitron": ['"Orbitron"', "sans-serif"],
        "nanum-square-light": ['"NanumSquareLight"', "sans-serif"],
        "nanum-square": ['"NanumSquare"', "sans-serif"],
        "nanum-square-bold": ['"NanumSquareBold"', "sans-serif"],
        "nanum-square-extra-bold": ['"NanumSquareExtraBold"', "sans-serif"],
        "nanum-square-acb": ['"NanumSquareAcb"', "sans-serif"],
        "nanum-square-aceb": ['"NanumSquareAceb"', "sans-serif"],
        "nanum-square-acl": ['"NanumSquareAcl"', "sans-serif"],
        "nanum-square-acr": ['"NanumSquareAcr"', "sans-serif"],
      },
      fontWeight: {
        "400": "400",
        "500": "500",
        "600": "600",
        "700": "700",
        "800": "800",
        "900": "900",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      colors: {
        sidebar: {
          "DEFAULT": "hsl(var(--sidebar-background))",
          "foreground": "hsl(var(--sidebar-foreground))",
          "primary": "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          "accent": "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          "border": "hsl(var(--sidebar-border))",
          "ring": "hsl(var(--sidebar-ring))",
        },
      },
    },
  },
} satisfies Config;
