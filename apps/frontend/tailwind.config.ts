import type { Config } from "tailwindcss";
import webConfig from "@cirrodrive/tailwind-config/web";

// eslint-disable-next-line import/no-default-export -- Tailwind CSS requires default export
export default {
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
        400: "400",
        500: "500",
        600: "600",
        700: "700",
        800: "800",
        900: "900",
      },
    },
  },
} satisfies Config;
