import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#ff6520",
        "primary-hover": "#ff7a35",
        "green-deepest": "#0f1e18",
        "green-dark": "#1a3a2f",
        "green-fridge": "#162e24",
        "green-medium": "#2d5a47",
        "green-light": "#4a7c67",
        cream: "#faf7f2",
        "cream-dark": "#f0ece3",
        divider: "#e8e2d8",
        mint: "#c8e0d4",
        muted: "#9aaa9e",
        secondary: "#7a9e8a",
        "muted-dark": "#5a7a6a",
        disabled: "#b0bdb8",
        "step-checked": "#f0f7f3",
        "step-hover": "#f7f5f0",
      },
    },
  },
  plugins: [],
};

export default config;
