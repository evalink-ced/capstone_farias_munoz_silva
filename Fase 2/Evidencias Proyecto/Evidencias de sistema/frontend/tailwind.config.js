import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: ["bg-theme-gradient", "dark:bg-theme-gradient-dark"],

  theme: {
    extend: {
      colors: {
        primary: "var(--primary-color)",
        secondary: "var(--secondary-color)",
        text: "var(--text-color)",
        accent: "var(--accent-color)",
        background_from: "var(--background-from)",
        background_to: "var(--background-to)",
      },
      backgroundImage: {
        "theme-gradient":
          "linear-gradient(to bottom right, var(--background-from), var(--background-to))",
        "theme-gradient-dark":
          "linear-gradient(to bottom right, var(--background-from-dark), var(--background-to-dark))",
      },
      keyframes: {
        wave: {
          "0%, 100%": {
            transform: "translateX(0) translateY(0)",
          },
          "50%": {
            transform: "translateX(-25px) translateY(-15px)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-20px) rotate(5deg)",
          },
        },
        "float-delayed": {
          "0%, 100%": {
            transform: "translateY(0) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-15px) rotate(-3deg)",
          },
        },
        "float-slow": {
          "0%, 100%": {
            transform: "translateY(0) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-10px) rotate(2deg)",
          },
        },
      },
      animation: {
        wave: "wave 8s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float-delayed 8s ease-in-out infinite",
        "float-slow": "float-slow 10s ease-in-out infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
