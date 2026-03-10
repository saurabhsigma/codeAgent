import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        panel: "#111827",
        surface: "#0f172a",
        border: "#1f2937",
        accent: "#38bdf8",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56, 189, 248, 0.15), 0 20px 40px rgba(15, 23, 42, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
