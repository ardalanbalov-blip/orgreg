import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        spsm: {
          burgundy: {
            50:  "#fdf2f4",
            100: "#fce7ea",
            200: "#f8d1d8",
            300: "#f2adb8",
            400: "#ea7f93",
            500: "#dc5470",
            600: "#c83359",
            700: "#a82549",
            800: "#80182f",
            900: "#6e1a2e",
            950: "#3e0915",
          },
          orange: {
            50:  "#fff7f0",
            100: "#ffedd9",
            200: "#ffd8b3",
            300: "#ffbc80",
            400: "#f09651",
            500: "#da6f43",
            600: "#c65a30",
            700: "#a54526",
            800: "#843924",
            900: "#6b3120",
            950: "#3a160d",
          },
          green: {
            50:  "#f5fae8",
            100: "#e9f4ce",
            200: "#d4e9a2",
            300: "#b9d96c",
            400: "#a3ca60",
            500: "#81a832",
            600: "#638524",
            700: "#4c661f",
            800: "#3e521e",
            900: "#35461e",
            950: "#1b260c",
          },
        },
      },
      fontFamily: {
        sans: ["Arial", "Helvetica Neue", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
