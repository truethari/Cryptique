/** @type {import("tailwindcss").Config} */
const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{svelte,js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      code: ["Fira Code", "monospace"],
    },
    extend: {},
  },

  darkMode: "class",
  plugins: [nextui()],
};
