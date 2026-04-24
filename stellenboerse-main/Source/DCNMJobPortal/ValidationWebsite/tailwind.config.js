/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dunkelblau: "rgb(5, 68, 144)",
        orange: "rgb(246, 171, 27)",
        hellblau: "rgb(42, 94, 170)",
        gelb: "rgb(255, 222, 4)",
        hellgelb: "rgb(250, 241, 146)",
        schwarz: "rgb(0, 0, 0)",
        weiss: "rgb(255, 255, 255)",
      },
    },
  },
  plugins: [],
};
