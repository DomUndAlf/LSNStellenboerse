/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Roboto", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      roboto: ["Roboto", "sans-serif"],
    },
    extend: {
      colors: {
        dunkelblau: "#042F63",
        textbody: "#49494b",
        orange: "rgb(246, 171, 27)",
        hellblau: "rgb(42, 94, 170)",
        gelb: "rgb(255, 222, 4)",
        hellgelb: "rgb(250, 241, 146)",
        schwarz: "rgb(0, 0, 0)",
        weiss: "rgb(255, 255, 255)",
      },
      keyframes: {
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
