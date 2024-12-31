/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0070f3",
          foreground: "white",
        },
        secondary: {
          DEFAULT: "#f5f5f5",
          foreground: "#1a1a1a",
        },
        destructive: {
          DEFAULT: "#ff4444",
          foreground: "white",
        },
      }
    },
  },
  plugins: [],
}