import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FBFBF9",
        surface: "#FFFFFF",
        "surface-subtle": "#F4F4F1",
        "border-subtle": "#E8E8E4",
        "text-primary": "#1C1E21",
        "text-secondary": "#5E636E",
        "text-muted": "#8A909D",
        accent: {
          DEFAULT: "#1E3A8A",
          hover: "#1E40AF",
          subtle: "#EFF6FF",
        },
        status: {
          lost: "#DC2626",
          "lost-bg": "#FEF2F2",
          found: "#0284C7",
          "found-bg": "#F0F9FF",
          verified: "#15803D",
          "verified-bg": "#F0FDF4",
          warning: "#D97706",
          "warning-bg": "#FFFBEB",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

