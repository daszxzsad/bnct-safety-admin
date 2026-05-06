import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#e8edf5",
          100: "#cdd5e0",
          500: "#3d4f61",
          700: "#1a2332",
          900: "#0a1f4d",
        },
        brand: {
          DEFAULT: "#0a1f4d",
          50: "#e8f0fe",
          500: "#1565c0",
          600: "#003087",
          900: "#0a1f4d",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans KR"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
