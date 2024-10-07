/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors:{
      colorF3F1EA: "#F3F1EA",
      color8BCA67: "#8BCA67",
      colorCDE1B1: "#CDE1B1",
      colorBDE3E3: "#BDE3E3",
      colorAED6EC: "#AED6EC",
      color5C9CF5: "#5C9CF5",
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

      },
    },
  },
  plugins: [],
};
