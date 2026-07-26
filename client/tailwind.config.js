/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#d3f656',
        secondary: '#0f1d14',
        accent: '#4ade80',
        background: '#111c14',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#0B130E",
          secondary: "#000000",
          accent: "#16a34a",
          "base-100": "#f0fdf4",
          "base-200": "#dcfce7",
          "base-300": "#bbf7d0",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#d3f656",
          secondary: "#ffffff",
          accent: "#4ade80",
          "base-100": "#0b130e",
          "base-200": "#060b08",
          "base-300": "#0f1d14",
        }
      }
    ]
  }
}
