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
        sans: ['"Inter"', '"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'glass': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.04), 0 12px 24px rgba(0,0,0,0.04)',
        'glass-lg': '0 0 0 1px rgba(0,0,0,0.03), 0 4px 8px rgba(0,0,0,0.04), 0 24px 48px rgba(0,0,0,0.06)',
        'glass-xl': '0 0 0 1px rgba(0,0,0,0.03), 0 8px 16px rgba(0,0,0,0.04), 0 32px 64px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(128,24,47,0.15)',
        'glow-orange': '0 0 20px rgba(218,111,67,0.15)',
        'glow-green': '0 0 20px rgba(129,168,50,0.15)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.8)',
        'elevated': '0 1px 2px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16,1,0.3,1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
};
export default config;
