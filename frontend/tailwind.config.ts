import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        panel: "var(--color-panel)",
        raised: "var(--color-raised)",
        border: "var(--color-border)",
        text: "var(--color-text)",
        dim: "var(--color-dim)",
        "signal-red": "#D71921",
        "ready-green": "#3DDC84",
      },
      fontFamily: {
        display: ["var(--font-doto)", "Courier New", "monospace"],
        mono: [
          "var(--font-jetbrains)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
        ui: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },
      letterSpacing: {
        label: "0.06em",
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
        full: "9999px",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "pulse-red": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(215, 25, 33, 0.4)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 0 4px rgba(215, 25, 33, 0)" },
        },
      },
      animation: {
        blink: "blink 1s steps(1) infinite",
        "pulse-red": "pulse-red 2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
