import type { Config } from "tailwindcss";
import { brand, card, ink } from "./src/lib/brand";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // See src/lib/brand.ts for where these come from.
      colors: { brand, card, ink },
      fontFamily: {
        // Set by next/font in src/app/layout.tsx; DM Sans is the portal's
        // `defaultFontFamily`.
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
