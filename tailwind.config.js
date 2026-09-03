/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          darkest: "#05080f",
          dark: "#080c14",
          card: "#0f172a",
          cardHover: "#162238",
          input: "#070a12",
          border: "#1e293b",
          borderGlow: "#334155"
        },
        crypto: {
          green: "#10b981",
          greenLight: "#34d399",
          red: "#ef4444",
          redLight: "#f87171",
          blue: "#38bdf8",
          bluePrimary: "#2563eb",
          amber: "#f59e0b",
          purple: "#a855f7"
        }
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
}
