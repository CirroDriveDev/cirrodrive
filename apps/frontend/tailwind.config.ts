import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// eslint-disable-next-line import/no-default-export -- Tailwind CSS requires default export
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [animate],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#d4eaf7",
          200: "#b6ccd8",
          300: "#3b3c3d",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          100: "#71c4ef",
          200: "#00668c",
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        text: {
          100: "#1d1c1c",
          200: "#313d44",
        },
        bg: {
          100: "#fffefb",
          200: "#f5f4f1",
          300: "#cccbc8",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
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
    },
  },
} satisfies Config;
