/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        chili: { DEFAULT: "#cb1b22", dark: "#96121a", light: "#fdeceb" },
        lime: { DEFAULT: "#167a3f", dark: "#0f5c2e" },
        masa: "#fff7ec",
        ink: "#221e1c",
        muted: "#6e6662",
        line: "#e8dbcc",
      },
      boxShadow: {
        card: "0 1px 2px rgba(34,30,28,.04), 0 12px 32px -12px rgba(34,30,28,.18)",
      },
    },
  },
  plugins: [],
};
