/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#07070c",
          900: "#0b0b13",
          850: "#101018",
          800: "#14141f",
          700: "#1c1c2a",
          600: "#2a2a3c",
        },
        ink: {
          100: "#f3f3f7",
          300: "#c7c7d6",
          500: "#8f8fa3",
          700: "#5c5c70",
        },
        brand: {
          300: "#b6a3ff",
          400: "#9b7cff",
          500: "#7c5cf5",
          600: "#6a3ff0",
          700: "#5528d6",
        },
        mint: {
          400: "#4ee6a8",
        },
        field: "#eef0fb",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 80px 10px rgba(124,92,245,0.25)",
        card: "0 8px 30px rgba(0,0,0,0.35)",
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(circle at 20% 0%, rgba(124,92,245,0.25), transparent 45%)",
      },
    },
  },
  plugins: [],
};
