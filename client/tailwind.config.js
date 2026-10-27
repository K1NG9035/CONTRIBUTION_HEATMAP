/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "hsl(var(--ink))",
        paper: "hsl(var(--paper))",
        muted: "hsl(var(--muted))",
        line: "hsl(var(--line))",
        lime: "hsl(var(--lime))",
        coral: "hsl(var(--coral))",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "sans-serif"],
        display: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(28, 35, 29, 0.08)",
      },
    },
  },
  plugins: [],
};
